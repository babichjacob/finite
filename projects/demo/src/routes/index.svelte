<script>
  // @ts-check
  import finite from "@babichjacob/finite";

  /** @param {number} ms */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const traffic = finite({
    green: {
      async __auto() {
        await wait(5_000);
        return "yellow";
      },
    },

    yellow: {
      async __auto() {
        await wait(2_000);
        return "red";
      },
    },

    red: {
      async __auto() {
        await wait(5_000);
        return "green";
      },
    },
  });

  const loadUsers = async () => {
    await wait(700);
    if (Math.random() > 0.5) throw new TypeError("loading users failed");
    return [
      { id: 1, name: "Wilbur" },
      { id: 2, name: "Xyler" },
      { id: 3, name: "Yanny" },
      { id: 4, name: "Zayn" },
    ];
  };

  let error;
  let users;

  const find = finite({
    loading: {
      async __auto() {
        try {
          users = await loadUsers();
          return "loaded";
        } catch (e) {
          error = e;
          return "error";
        }
      },
    },
    error: {
      retry: "loading",
    },
    loaded: {},
  });

  // The existing debounce feature still works
  const rgb = finite({
    red: {
      advance: "green",
    },
    green: {
      _enter() {
        // @ts-expect-error - Typed wrongly upstream unfortunately
        this.advance.debounce(2_000);
      },
      
      _exit() {
        // @ts-expect-error - Typed wrongly upstream unfortunately
        this.advance.debounce(null);
      },

      advance: "blue",

      reverse: "red",
    },
    blue: {
      advance: "red",
    },
  });
</script>

<section>
  <div style:background-color={$traffic}>{$traffic}</div>
</section>

<section>
  {#if $find === "loading"}
    <h1>Loading...</h1>
  {:else if $find === "loaded"}
    <h3>Users (online: {users.length})</h3>
    <ol>
      {#each users as user}
        <li>{user.name}</li>
      {/each}
    </ol>
  {:else if $find === "error"}
    <h2>
      There was a {error.name} (full description: {error.message}) thrown while
      trying to load users
    </h2>
    <button on:click={find.retry}>Retry</button>
  {/if}
</section>

<section>
  <h1>
    {$rgb}
  </h1>

  <button on:click={rgb.advance}>Advance</button>
  {#if $rgb === "green"}will automatically advance to blue if nothing is done within 2 seconds{/if}
</section>
