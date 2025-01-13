<script>
  import { Router, Route, Link } from "svelte-routing";
  import Mic from "./routes/Mic.svelte";
  import Home from "./routes/Home.svelte";
  import Login from "./routes/Login.svelte";
  import Signup from "./routes/Signup.svelte";
</script>


<Router>

  <Route path="/" component={Home} />
  <Route path="/mic" component={Mic} />
  <Route path="/login" component={Login}/>
  <Route path='/signup' component={Signup}/>
  
</Router>

<style>
  :root {
    background-color: #141414;
  }
</style>