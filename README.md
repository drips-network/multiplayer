# 💧🎮 Drips Multiplayer

`multiplayer` is a server application that enables [Drips'](https://drips.network) Collaborative Drip List functionality. With Collaborative Drip Lists, a group of users can "draft" a list by voting on its recipients off-chain, before eventually deploying the result on-chain. The server uses a Postgres database, and allows the creation of "voting rounds", voting, and other CRUD-style operations, with authentication through ad-hoc EIP-1271 or simple bytestring signatures of human-readable messages.

This repo is still work-in-progress, and further documentation will be shared once Multiplayer functionality goes live on mainnet Drips.
