import apiClient from "./api";
import { OrgChartApiResponse } from "../store/slices/orgChartSlice";

/**
 * Service for organizational chart operations
 * Handles API communication for fetching organizational chart data
 */
class OrgChartService {
  /**
   * Retrieves the organizational chart data for a specific employee
   * @param employeeId - The unique identifier of the employee whose chart to retrieve
   * @returns Promise containing the organizational chart API response
   * @throws {AxiosError} When the API request fails
   */
  async getPeopleChart(employeeId: number): Promise<OrgChartApiResponse> {
    try {
      const response = await apiClient.get<OrgChartApiResponse>(
        `/relationship/people_chart/${employeeId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export a singleton instance for use throughout the application
export const orgChartService = new OrgChartService();

// Export the class for testing purposes if needed
export default OrgChartService;
