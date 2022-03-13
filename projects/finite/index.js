import fsm from "svelte-fsm";

/**
 * @template T
 * @typedef {{ -readonly [P in keyof T]: T[P] }} NotReadonly
 */

/**
 * @typedef {NotReadonly<Parameters<typeof import("svelte-fsm").default>[1]>} Args
 * @typedef {Args[keyof Args]} BaseActions
 */

/**
 * @typedef {BaseActions[keyof Omit<BaseActions, "_enter" | "_exit">]} ActionFunction
 */

/**
 * @typedef {BaseActions[keyof Pick<BaseActions, "_enter" | "_exit">]} LifecycleFunction
 */

/**
 * @template State
 * @typedef {function(): Promise<State>} Auto
 */

/**
 * @template {string | symbol} State
 * @template {string | symbol} Action
 * @typedef {{ [action in Action]?: ActionFunction } & { __auto?: Auto<State> }} ActionsWrapper
 */

/**
 * @template {string | symbol} State
 * @template Actions
 * @typedef {{ [k in State]: Actions & { _enter?: LifecycleFunction, _exit?: LifecycleFunction }} & { "*": { __finite_auto?: (data: State) => State } }} ArgsExtended
 */

// TODO: type the arguments for the action function
// TODO: not need to override the return type
// Maybe I should just re-implement svelte-fsm's API instead of wrapping it
/**
 * @template {string | symbol} State
 * @template {string | symbol} Action
 * @template {State} ReturnedState
 * @param {Record<State, ActionsWrapper<ReturnedState, Action>>} states
 * @param {State} [initial]
 * @returns {{ subscribe: function(function(State): void): (function(): void)} & Record<Exclude<Action, "__auto">, function(any): void>}
 */
const finite = (states, initial) => {
  if (!initial) initial = /** @type {State[]} */ (Object.keys(states))[0];

  /** @type {ArgsExtended<State, Record<Action, ActionFunction>>} */
  const args = /** @type {any} */ ({
    "*": { __finite_auto: /** @param {State} state */ (state) => state },
  });

  /** @type {Record<string, boolean>} */
  const waiting = {};

  let counter = 0;

  for (const [
    state,
    actions,
  ] of /** @type {[State, (typeof states)[State]][]} */ (
    Object.entries(states)
  )) {
    const { __auto, ...copy } = actions;
    // TypeScript is cool and does good things
    args[state] = /** @type {any} */ (copy);

    if (!__auto) continue;

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

    args[state]._enter = _enter;
    args[state]._exit = _exit;
  }

  // TypeScript is cool and does good things
  const machine = fsm(/** @type {string} */ (initial), args);
  return /** @type {any} */ (machine);
};

export default finite;
