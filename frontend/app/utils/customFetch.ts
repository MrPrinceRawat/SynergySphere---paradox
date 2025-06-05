export async function fetchWithAuth(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const response = await fetch(input, init);
  
    if (response.status === 401) {
      // Redirect to logout
      window.location.href = "/logout"; // Or your logout endpoint
      throw new Error("Unauthorized - Logging out...");
    }
  
    return response;
  }