# PoC to prove how to use Verifiable Credentials (VC) for counting votes

## How does it work?

![How It Works](./zkorum_vote_protocol.png.drawio.png)

## Low-level implementation

The functionality has been implemented in the Dock [crypto-wasm-ts](https://github.com/docknetwork/crypto-wasm-ts) library:

- this [unit test](https://github.com/docknetwork/crypto-wasm-ts/blob/master/tests/composite-proofs/msg-js-obj/blind-sig-with-attribute-equality-and-pseudonym.spec.ts) showcases the protocol (except for "Pseudonym Secret" - but it is easy to improve it).
- [this PR](https://github.com/docknetwork/crypto-wasm-ts/pull/19) contains an interesting conversation for a background on the why and the how

More work needs to be done to:

- add high-level abstractions over the blinding mechanism
- add support for pseudonym and blinding in wallets starting from Dock Wallet

## Open questions

- how to implement the schedule-send functionality?
