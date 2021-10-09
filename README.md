# Technical Test Pager

## Instruction

To install and build the projet, please run the following commands:

```
npm install
npm run build
```

## Tests

To run units tests:

```
npm run test
```

## Concurrency issues

To solve possible concurrent access issues, all calls to create or update method of the `persistencePort` return a boolean. If it is `true` then the action has been completed and the notification services must be called. Otherwise it means that the action has already been performed during a concurrent acces and therefore there is not left to do.
