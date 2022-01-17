<h1 align="center">♾ Finite</h1>

This library for Svelte is just a small wrapper around the excellent [`svelte-fsm`](https://github.com/kenkunz/svelte-fsm) with small design tweaks to my taste.

## 💻 Installation
```sh
npm install --save-dev @babichjacob/finite
```

## 🛠 Usage
Import the finite state machine creating function from `@babichjacob/finite` and use it just like `svelte-fsm`, except with the additional `__auto` helper and implicitly use the first state listed as the initial one:

```svelte
<script>
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
</script>

<div style:background-color={$traffic}>{$traffic}</div>
```

## 😵 Help! I have a question
Create an issue and I'll try to help.

## 😡 Fix! There is something that needs improvement
Create an issue or pull request and I'll try to fix.

## 📄 License
MIT

## 🙏 Attribution

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
