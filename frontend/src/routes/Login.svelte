<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { checkToken } from '../lib/checkToken';

  let username = "";
  let password = "";
  let errorMessage = "";
  let successMessage = "";

  onMount(() => {
    checkToken();
  });


  // Handle form submission
  async function handleSubmit() {

    const response = await fetch('/api/login', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: username, password: password})
    })

    const data = await response.json()
    
    console.log(response.status)
    
    switch(response.status){
      case 200:
        window.location.href = '/mic';
        localStorage.setItem('token', data.token)
        break;
      case 404:
        errorMessage = "User not found!";
        break;
      case 500:
        errorMessage = "Something went wrong!";
        break;
    }

  }
</script>

<div class="login-container">
  <h2>Login</h2>

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
    <button type="submit">Login</button>
  </form>

  <br>
  <a class="signup-link" href="/signup">Don't have an account? Sign up here</a>
</div>

<style>

  .signup-link {
    margin-top: 10px;
    color:lightblue;
    font-family: Consolas, monaco, monospace;
  }

  .login-container {
    max-width: 300px;
    margin: 100px auto;
    padding: 20px;
    position: relative;
    top:15vh;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #1a1a1a;
    text-align: center;
    align-items: center;
  }

  .error{
    padding-bottom: 10px;
    color: red;
    font-family: Consolas, monaco, monospace;
    text-align: center;
  }

  .success{
    padding-bottom: 10px;
    font-family: Consolas, monaco, monospace;
    color: lightgreen;
    text-align: center;
  }

  .login-container h2 {
    text-align: center;
    margin-bottom: 20px;
    color:white;
    font-family: Consolas, monaco, monospace;
  }

  .login-container input {
    width: 95%;
    padding: 8px;
    margin-bottom: 10px;
    border-radius: 4px;
    border: none;
    outline: none;
    font-family: Consolas, monaco, monospace;

  }

  .login-container button {
    width: 100%;
    padding: 10px;
    background-color: #8e45af;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.3s;
  }

  .login-container button:hover {
    background-color: rgb(152, 83, 184);
  }
</style>
