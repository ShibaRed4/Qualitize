<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { checkToken } from "../lib/checkToken";

  // Token check
  onMount(() => {
    checkToken();
  });

  let username = "";
  let password = "";
  let errorMessage = "";
  let successMessage = "";

  // Handle form submission
  async function handleSubmit() {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    });

    const data = await response.json();

    if (response.status == 200 && data.token) {
      localStorage.setItem("token", data.token);
      navigate("/login");
    }
  }
</script>

<div class="signup-container">
  <h2>Sign Up</h2>

  <!-- Error message -->
  {#if errorMessage}
    <div class="error">{errorMessage}</div>
  {/if}

  <!-- Success message -->
  {#if successMessage}
    <div class="success">{successMessage}</div>
  {/if}

  <!-- Login form -->
  <form on:submit|preventDefault={handleSubmit}>
    <input type="text" placeholder="Username" bind:value={username} required />
    <input
      type="password"
      placeholder="Password"
      bind:value={password}
      required
    />
    <button type="submit">Sign Up</button>
  </form>

  <br />
  <a class="login-link" href="/login">Already have an account? Login here</a>
</div>

<style>
  .login-link {
    margin-top: 10px;
    color: lightblue;
    font-family: Consolas, monaco, monospace;
  }

  .signup-container {
    max-width: 300px;
    margin: 100px auto;
    padding: 20px;
    position: relative;
    top: 15vh;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #1a1a1a;
    text-align: center;
    align-items: center;
  }

  .error {
    padding-bottom: 10px;
    color: red;
    font-family: Consolas, monaco, monospace;
    text-align: center;
  }

  .success {
    padding-bottom: 10px;
    font-family: Consolas, monaco, monospace;
    color: lightgreen;
    text-align: center;
  }

  .signup-container h2 {
    text-align: center;
    margin-bottom: 20px;
    color: white;
    font-family: Consolas, monaco, monospace;
  }

  .signup-container input {
    width: 95%;
    padding: 8px;
    margin-bottom: 10px;
    border-radius: 4px;
    border: none;
    outline: none;
    font-family: Consolas, monaco, monospace;
  }

  .signup-container button {
    width: 100%;
    padding: 10px;
    background-color: #8e45af;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.3s;
  }

  .signup-container button:hover {
    background-color: rgb(152, 83, 184);
  }
</style>
