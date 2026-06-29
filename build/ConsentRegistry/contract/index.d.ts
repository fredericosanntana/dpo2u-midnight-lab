import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  grantConsent(context: __compactRuntime.CircuitContext<PS>,
               subject_id_0: Uint8Array,
               purposes_0: bigint,
               policy_version_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeConsent(context: __compactRuntime.CircuitContext<PS>,
                subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateConsentPurposes(context: __compactRuntime.CircuitContext<PS>,
                        subject_id_0: Uint8Array,
                        new_purposes_0: bigint,
                        policy_version_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getConsentStatus(context: __compactRuntime.CircuitContext<PS>,
                   subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getConsentPurposes(context: __compactRuntime.CircuitContext<PS>,
                     subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getConsentPolicyVersion(context: __compactRuntime.CircuitContext<PS>,
                          subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalConsentsGranted(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRevocations(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  grantConsent(context: __compactRuntime.CircuitContext<PS>,
               subject_id_0: Uint8Array,
               purposes_0: bigint,
               policy_version_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeConsent(context: __compactRuntime.CircuitContext<PS>,
                subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateConsentPurposes(context: __compactRuntime.CircuitContext<PS>,
                        subject_id_0: Uint8Array,
                        new_purposes_0: bigint,
                        policy_version_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getConsentStatus(context: __compactRuntime.CircuitContext<PS>,
                   subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getConsentPurposes(context: __compactRuntime.CircuitContext<PS>,
                     subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getConsentPolicyVersion(context: __compactRuntime.CircuitContext<PS>,
                          subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalConsentsGranted(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRevocations(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  grantConsent(context: __compactRuntime.CircuitContext<PS>,
               subject_id_0: Uint8Array,
               purposes_0: bigint,
               policy_version_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeConsent(context: __compactRuntime.CircuitContext<PS>,
                subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateConsentPurposes(context: __compactRuntime.CircuitContext<PS>,
                        subject_id_0: Uint8Array,
                        new_purposes_0: bigint,
                        policy_version_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getConsentStatus(context: __compactRuntime.CircuitContext<PS>,
                   subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getConsentPurposes(context: __compactRuntime.CircuitContext<PS>,
                     subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getConsentPolicyVersion(context: __compactRuntime.CircuitContext<PS>,
                          subject_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalConsentsGranted(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  getTotalRevocations(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  consent_status: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  consent_purposes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  consent_policy_version: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly total_consents_granted: bigint;
  readonly total_revocations: bigint;
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
