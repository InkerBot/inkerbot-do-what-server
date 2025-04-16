package bot.inker.dowhat.entity;

public final class BatteryInfo {
  private final boolean isCharging;
  private final boolean isPlugged;
  private final int percentage;
  private final long timeRemaining;

  public BatteryInfo(boolean isCharging, boolean isPlugged, int percentage, long timeRemaining) {
    this.isCharging = isCharging;
    this.isPlugged = isPlugged;
    this.percentage = percentage;
    this.timeRemaining = timeRemaining;
  }

  public boolean isCharging() {
    return isCharging;
  }

  public boolean isPlugged() {
    return isPlugged;
  }

  public int percentage() {
    return percentage;
  }

  public long timeRemaining() {
    return timeRemaining;
  }

  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) return false;

    BatteryInfo that = (BatteryInfo) o;
    return isCharging == that.isCharging && isPlugged == that.isPlugged && percentage == that.percentage && timeRemaining == that.timeRemaining;
  }

  @Override
  public int hashCode() {
    int result = Boolean.hashCode(isCharging);
    result = 31 * result + Boolean.hashCode(isPlugged);
    result = 31 * result + percentage;
    result = 31 * result + Long.hashCode(timeRemaining);
    return result;
  }

  @Override
  public String toString() {
    return "BatteryInfo{" +
      "isCharging=" + isCharging +
      ", isPlugged=" + isPlugged +
      ", percentage=" + percentage +
      ", timeRemaining=" + timeRemaining +
      '}';
  }
}