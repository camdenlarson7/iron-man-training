import { RunWorkoutDay, StravaActivity, StravaWeeklyStats } from "./types/training";

// Required environment variables
const STRAVA_CLIENT_SECRET: string = process.env.STRAVA_CLIENT_SECRET || "";
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN || "";
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || "";
// const USER_ID = "108370651"; // Unused for now

if (!STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN || !STRAVA_CLIENT_ID) {
	throw new Error("Missing Strava environment variables");
}

interface StravaTokens {
	access_token: string;
	refresh_token: string;
	expires_at: number;
}

class StravaWorkoutQuery {
	private tokens: StravaTokens | null;

	constructor() {
		this.tokens = null;
	}

	private async refreshToken(): Promise<void> {
		try {
			const response = await fetch("https://www.strava.com/oauth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					client_id: STRAVA_CLIENT_ID,
					client_secret: STRAVA_CLIENT_SECRET,
					refresh_token: STRAVA_REFRESH_TOKEN,
					grant_type: "refresh_token",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to refresh token");
			}

			const data = await response.json();
			this.tokens = {
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				expires_at: data.expires_at * 1000, // Convert to milliseconds
			};

			// Store the athlete ID from the refresh response
		} catch (error) {
			console.error("Error refreshing token:", error);
			throw new Error("Failed to refresh authentication token");
		}
	}

	private async ensureValidToken(): Promise<void> {
		if (!this.tokens || Date.now() >= this.tokens.expires_at) {
			await this.refreshToken();
		}
	}

	private async makeAuthorizedRequest(url: string): Promise<unknown> {
		await this.ensureValidToken();

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${this.tokens!.access_token}`,
			},
		});

		if (!response.ok) {
			throw new Error(
				`HTTP error! status: ${response.status}: ${await response.text()}`,
			);
		}

		return response.json();
	}

	async getActivitiesForDateRange(startDate: Date, endDate: Date): Promise<StravaActivity[]> {
		try {
			const startTimestamp = Math.floor(startDate.getTime() / 1000);
			const endTimestamp = Math.floor(endDate.getTime() / 1000);
			let page = 1;
			let allActivities: StravaActivity[] = [];
			let hasMoreActivities = true;

			while (hasMoreActivities) {
				const response = await this.makeAuthorizedRequest(
					`https://www.strava.com/api/v3/athlete/activities?before=${endTimestamp}&after=${startTimestamp}&per_page=200&page=${page}`,
				);

				const activities = response as StravaActivity[];

				if (activities.length === 0) {
					hasMoreActivities = false;
				} else {
					allActivities = [...allActivities, ...activities];
					page++;
				}
			}

			return allActivities;
		} catch (error) {
			console.error("Error fetching activities:", error);
			throw new Error("Failed to fetch Strava activities");
		}
	}

	async getWeeklyStats(weekNumber: number, trainingStartDate: string): Promise<StravaWeeklyStats> {
		try {
			// Calculate week start and end dates using the same logic as getWeekDateRange
			const startDate = new Date(trainingStartDate + 'T00:00:00');
			const weekStart = new Date(startDate);
			weekStart.setDate(startDate.getDate() + (weekNumber - 1) * 7);
			
			const weekEnd = new Date(weekStart);
			weekEnd.setDate(weekStart.getDate() + 6);
			weekEnd.setHours(23, 59, 59, 999);

			// Check if the week is in the future - if so, return zeros without making API calls
			const now = new Date();
			if (weekStart > now) {
				return {
					week: weekNumber,
					swim: 0,
					bike: 0,
					run: 0,
					total: 0,
					activities: []
				};
			}

			const activities = await this.getActivitiesForDateRange(weekStart, weekEnd);

			// Group activities by discipline and calculate hours
			let swimHours = 0;
			let bikeHours = 0;
			let runHours = 0;

			activities.forEach((activity) => {
				const hours = activity.moving_time / 3600; // Convert seconds to hours
				
				switch (activity.type) {
					case 'Swim':
						swimHours += hours;
						break;
					case 'Ride':
						bikeHours += hours;
						break;
					case 'Run':
						runHours += hours;
						break;
					case 'Workout':
						if (activity.sport_type == 'Tennis') {
							runHours += hours
						}
						break;
				}
			});

			return {
				week: weekNumber,
				swim: Number(swimHours.toFixed(2)),
				bike: Number(bikeHours.toFixed(2)),
				run: Number(runHours.toFixed(2)),
				total: Number((swimHours + bikeHours + runHours).toFixed(2)),
				activities
			};
		} catch (error) {
			console.error("Error calculating weekly stats:", error);
			throw new Error("Failed to calculate weekly training stats");
		}
	}

	async getWorkoutDaysForYear(): Promise<RunWorkoutDay[]> {
		try {
			const endDate = Math.floor(Date.now() / 1000);
			const startDate = endDate - 365 * 24 * 60 * 60;
			let page = 1;
			let allActivities: StravaActivity[] = [];
			let hasMoreActivities = true;

			while (hasMoreActivities) {
				const response = await this.makeAuthorizedRequest(
					`https://www.strava.com/api/v3/athlete/activities?before=${endDate}&after=${startDate}&per_page=200&page=${page}`,
				);

				const activities = response as StravaActivity[];

				if (activities.length === 0) {
					hasMoreActivities = false;
				} else {
					allActivities = [...allActivities, ...activities];
					page++;
				}
			}

			// Group activities by date
			const workoutMap = new Map<string, RunWorkoutDay>();

			allActivities.forEach((activity) => {
				if (activity.type.toLowerCase() === "run") {
					const date = activity.start_date.split("T")[0];

					if (!workoutMap.has(date)) {
						workoutMap.set(date, {
							type: "run",
							date: date,
							distance_meters: 0,
							time_seconds: 0,
							activities_count: 0,
						});
					}

					const workoutDay = workoutMap.get(date)!;
					workoutDay.distance_meters += activity.distance;
					workoutDay.time_seconds += activity.moving_time;
					workoutDay.activities_count += 1;
				}
			});

			return Array.from(workoutMap.values());
		} catch (error) {
			console.error("Loader error: ", error);
			throw new Error("Error loading workout data");
		}
	}

	// Convenience method for getting week progress with activities
	async getWeekProgress(weekNumber: number, trainingStartDate: string): Promise<StravaWeeklyStats | null> {
		try {
			const weeklyStats = await this.getWeeklyStats(weekNumber, trainingStartDate)
			return weeklyStats
		} catch (error) {
			console.error('Failed to load Strava progress:', error)
			return null
		}
	}
}

// Create singleton instance
const stravaClient = new StravaWorkoutQuery();

// Export the getter function
export default stravaClient;

// https://www.strava.com/oauth/authorize?client_id=142288&response_type=code&redirect_uri=https://rankincodes.com&approval_prompt=force&scope=activity:read_all,profile:read_all
