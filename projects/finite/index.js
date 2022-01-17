import fsm from "svelte-fsm";

/**
 * @template T
 * @typedef {{ -readonly [P in keyof T]: T[P] }} NotReadonly
 */

/**
 * @typedef {NotReadonly<Parameters<typeof import("svelte-fsm").default>[1]>} Args
 * @typedef { Args[keyof Args] } Actions
 */

/**
 * @template {string} State
 * @typedef { function(): Promise<State> } Auto
 */

/**
 * @template {string} State
 * @typedef {Omit<Actions, "_enter" | "_exit"> & { __auto: Auto<State> }} ActionsWrapper
 */

/**
 * @template {string} State
 * @typedef {{ [k in keyof Args]: Actions & { __finite_auto?: (data: State) => State } }} ArgsExtended
 */

/**
 * @template {string} State
 * @param {Record<State, ActionsWrapper<State>>} states
 * @param {State} [initial]
 */
const finite = (states, initial) => {
  if (!initial) initial = /** @type {State[]} */ (Object.keys(states))[0];

  /** @type {ArgsExtended<State>} */
  const args = { "*": {} };

  /** @type {Record<string, boolean>} */
  const waiting = {};

  let counter = 0;

  for (const [
    state,
    actions,
  ] of /** @type {[State, ActionsWrapper<State>][]} */ (
    Object.entries(states)
  )) {
    args[state] = { ...actions };
    if ("__auto" in actions) {
      const __auto = actions["__auto"];

      const _enter = () => {
        const promise = __auto();

        const id = counter;
        counter += 1;

        waiting[id] = true;
        promise.then((next) => {
          if (waiting[id]) {
            // @ts-ignore
            machine.__finite_auto(next);
          }

          delete waiting[id];
        });
      };

      const _exit = () => {
        for (const id of Object.keys(waiting)) {
          waiting[id] = false;
        }
      };

      delete args[state]["__auto"];
      args[state]._enter = _enter;
      args[state]._exit = _exit;
    }
  }

  args["*"].__finite_auto = (state) => state;

  const machine = fsm(initial, args);
  return machine;
};

export default finite;
