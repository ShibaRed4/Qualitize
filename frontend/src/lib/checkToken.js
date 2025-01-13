export function checkToken(){
    
    const allowedPaths = [`${window.location.origin}/login`, `${window.location.origin}/signup`];

    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Decode the JWT without verification to check expiration
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decoding the JWT to get the payload
        const expDate = decodedToken.exp * 1000; // Convert to milliseconds
        const currentDate = new Date().getTime();

        if (currentDate > expDate) {
          // Token expired, clear token and redirect to login
          localStorage.removeItem("token");
          window.location.href = "/login"
        } else {
            if(allowedPaths.includes(window.location.href)){
                window.location.href = "/mic"
            }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        window.location.href = "/login"
      }
    } else {
        if (!allowedPaths.includes(window.location.href)) {
            window.location.href = "/login";
        } 
    }
}

