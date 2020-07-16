export default (fn: (...unknown) => unknown, logger:(...unknown) => void = () => {}): unknown => {
  try {
    return fn();
  } catch (e) {
    logger(e);
  }
}
