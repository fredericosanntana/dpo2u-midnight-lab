import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  logEvent(context: __compactRuntime.CircuitContext<PS>,
           controller_id_0: Uint8Array,
           event_type_0: bigint,
           block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  logDeletionRequest(context: __compactRuntime.CircuitContext<PS>,
                     controller_id_0: Uint8Array,
                     actor_id_0: Uint8Array,
                     block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  confirmDeletion(context: __compactRuntime.CircuitContext<PS>,
                  controller_id_0: Uint8Array,
                  actor_id_0: Uint8Array,
                  block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  logBreachEvent(context: __compactRuntime.CircuitContext<PS>,
                 controller_id_0: Uint8Array,
                 block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getControllerEventCount(context: __compactRuntime.CircuitContext<PS>,
                          controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getLastEventType(context: __compactRuntime.CircuitContext<PS>,
                   controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getLastEventBlock(context: __compactRuntime.CircuitContext<PS>,
                    controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalEvents(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalDeletionRequests(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalDeletionsConfirmed(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalBreachEvents(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  logEvent(context: __compactRuntime.CircuitContext<PS>,
           controller_id_0: Uint8Array,
           event_type_0: bigint,
           block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  logDeletionRequest(context: __compactRuntime.CircuitContext<PS>,
                     controller_id_0: Uint8Array,
                     actor_id_0: Uint8Array,
                     block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  confirmDeletion(context: __compactRuntime.CircuitContext<PS>,
                  controller_id_0: Uint8Array,
                  actor_id_0: Uint8Array,
                  block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  logBreachEvent(context: __compactRuntime.CircuitContext<PS>,
                 controller_id_0: Uint8Array,
                 block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getControllerEventCount(context: __compactRuntime.CircuitContext<PS>,
                          controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getLastEventType(context: __compactRuntime.CircuitContext<PS>,
                   controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getLastEventBlock(context: __compactRuntime.CircuitContext<PS>,
                    controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalEvents(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalDeletionRequests(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalDeletionsConfirmed(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalBreachEvents(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  logEvent(context: __compactRuntime.CircuitContext<PS>,
           controller_id_0: Uint8Array,
           event_type_0: bigint,
           block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  logDeletionRequest(context: __compactRuntime.CircuitContext<PS>,
                     controller_id_0: Uint8Array,
                     actor_id_0: Uint8Array,
                     block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  confirmDeletion(context: __compactRuntime.CircuitContext<PS>,
                  controller_id_0: Uint8Array,
                  actor_id_0: Uint8Array,
                  block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  logBreachEvent(context: __compactRuntime.CircuitContext<PS>,
                 controller_id_0: Uint8Array,
                 block_number_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getControllerEventCount(context: __compactRuntime.CircuitContext<PS>,
                          controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getLastEventType(context: __compactRuntime.CircuitContext<PS>,
                   controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getLastEventBlock(context: __compactRuntime.CircuitContext<PS>,
                    controller_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalEvents(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalDeletionRequests(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalDeletionsConfirmed(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalBreachEvents(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  readonly event_count: bigint;
  events_by_controller: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  last_event_type: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  last_event_block: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly deletion_requests: bigint;
  readonly deletions_confirmed: bigint;
  readonly breach_events: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
