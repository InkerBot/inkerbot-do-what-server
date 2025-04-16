package bot.inker.dowhat.entity;

import java.util.List;
import java.util.Objects;

public final class DeviceResponse {
  private final String device;
  private final boolean online;

  private final long lastUpdate;
  private final String activity;
  private final List<String> allWindows;
  private final int battery;

  public DeviceResponse(String device, boolean online, long lastUpdate, String activity, List<String> allWindows, int battery) {
    this.device = device;
    this.online = online;
    this.lastUpdate = lastUpdate;
    this.activity = activity;
    this.allWindows = allWindows;
    this.battery = battery;
  }

  public String device() {
    return device;
  }

  public boolean online() {
    return online;
  }

  public long lastUpdate() {
    return lastUpdate;
  }

  public String lastWindow() {
    return activity;
  }

  public List<String> allWindows() {
    return allWindows;
  }

  public int battery() {
    return battery;
  }

  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) return false;

    DeviceResponse that = (DeviceResponse) o;
    return online == that.online && lastUpdate == that.lastUpdate && battery == that.battery && Objects.equals(device, that.device) && Objects.equals(activity, that.activity) && Objects.equals(allWindows, that.allWindows);
  }

  @Override
  public int hashCode() {
    int result = Objects.hashCode(device);
    result = 31 * result + Boolean.hashCode(online);
    result = 31 * result + Long.hashCode(lastUpdate);
    result = 31 * result + Objects.hashCode(activity);
    result = 31 * result + Objects.hashCode(allWindows);
    result = 31 * result + battery;
    return result;
  }

  @Override
  public String toString() {
    return "DeviceResponse{" +
      "device='" + device + '\'' +
      ", online=" + online +
      ", lastUpdate=" + lastUpdate +
      ", activity='" + activity + '\'' +
      ", allWindows=" + allWindows +
      ", battery=" + battery +
      '}';
  }
}
