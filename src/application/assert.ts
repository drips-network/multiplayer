export default function assert(
  condition: unknown,
  message = 'Assertion Error',
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
