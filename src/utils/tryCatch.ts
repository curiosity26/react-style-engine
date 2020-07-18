export default (fn: (...unknown) => unknown, logger:(...unknown) => void = () => undefined): unknown => {
  try {
    return fn();
  } catch (e) {
    logger(e);
  }
}
