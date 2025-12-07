import apiClient from "./api";

/**
 * Types for organizational chart data
 */
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  profile_pic?: string;
  thumbnail?: string;
  [key: string]: any; // Allow for additional properties from API
}

export interface OrgChartData {
  employee: Employee;
  manager?: Employee;
  direct_reports?: Employee[];
  related_employees?: Employee[];
  [key: string]: any; // Allow for additional properties from API
}

export interface OrgChartResponse {
  data: OrgChartData;
  message?: string;
  status?: string;
}

/**
 * Service for organizational chart operations
 */
class OrgChartService {
  /**
   * Retrieves the organizational chart data for a specific employee
   * @param employeeId - The unique identifier of the employee
   * @returns Promise containing the organizational chart data
   */
  async getPeopleChart(employeeId: number): Promise<OrgChartData> {
    try {
      const response = await apiClient.get<OrgChartResponse>(
        `/relationship/people_chart/${employeeId}`
      );

      // Return the data property if it exists, otherwise return the full response
      return response.data.data || response.data;
    } catch (error) {
      // Error is already handled by the global interceptor
      // Re-throw to allow component-level error handling
      throw error;
    }
  }
}

// Export a singleton instance
export const orgChartService = new OrgChartService();

// Export the class for testing purposes if needed
export default OrgChartService;
