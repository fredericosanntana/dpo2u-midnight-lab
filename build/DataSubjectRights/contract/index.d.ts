import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  submitRequest(context: __compactRuntime.CircuitContext<PS>,
                request_id_0: Uint8Array,
                req_type_0: bigint,
                submitted_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fulfillRequest(context: __compactRuntime.CircuitContext<PS>,
                 request_id_0: Uint8Array,
                 resolved_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  rejectRequest(context: __compactRuntime.CircuitContext<PS>,
                request_id_0: Uint8Array,
                resolved_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  markRequestOverdue(context: __compactRuntime.CircuitContext<PS>,
                     request_id_0: Uint8Array,
                     current_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getRequestStatus(context: __compactRuntime.CircuitContext<PS>,
                   request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestType(context: __compactRuntime.CircuitContext<PS>,
                 request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestSubmittedBlock(context: __compactRuntime.CircuitContext<PS>,
                           request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestResolvedBlock(context: __compactRuntime.CircuitContext<PS>,
                          request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRequests(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalFulfilled(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRejected(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalOverdue(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  submitRequest(context: __compactRuntime.CircuitContext<PS>,
                request_id_0: Uint8Array,
                req_type_0: bigint,
                submitted_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fulfillRequest(context: __compactRuntime.CircuitContext<PS>,
                 request_id_0: Uint8Array,
                 resolved_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  rejectRequest(context: __compactRuntime.CircuitContext<PS>,
                request_id_0: Uint8Array,
                resolved_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  markRequestOverdue(context: __compactRuntime.CircuitContext<PS>,
                     request_id_0: Uint8Array,
                     current_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getRequestStatus(context: __compactRuntime.CircuitContext<PS>,
                   request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestType(context: __compactRuntime.CircuitContext<PS>,
                 request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestSubmittedBlock(context: __compactRuntime.CircuitContext<PS>,
                           request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestResolvedBlock(context: __compactRuntime.CircuitContext<PS>,
                          request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRequests(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalFulfilled(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRejected(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalOverdue(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  submitRequest(context: __compactRuntime.CircuitContext<PS>,
                request_id_0: Uint8Array,
                req_type_0: bigint,
                submitted_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  fulfillRequest(context: __compactRuntime.CircuitContext<PS>,
                 request_id_0: Uint8Array,
                 resolved_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  rejectRequest(context: __compactRuntime.CircuitContext<PS>,
                request_id_0: Uint8Array,
                resolved_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  markRequestOverdue(context: __compactRuntime.CircuitContext<PS>,
                     request_id_0: Uint8Array,
                     current_block_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getRequestStatus(context: __compactRuntime.CircuitContext<PS>,
                   request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestType(context: __compactRuntime.CircuitContext<PS>,
                 request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestSubmittedBlock(context: __compactRuntime.CircuitContext<PS>,
                           request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getRequestResolvedBlock(context: __compactRuntime.CircuitContext<PS>,
                          request_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRequests(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalFulfilled(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRejected(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalOverdue(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  request_status: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  request_type: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  request_submitted_block: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  request_resolved_block: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly total_requests: bigint;
  readonly total_fulfilled: bigint;
  readonly total_rejected: bigint;
  readonly total_overdue: bigint;
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
