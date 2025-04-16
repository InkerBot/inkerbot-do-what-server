package bot.inker.dowhat.entity;

import java.util.List;
import java.util.Objects;

public final class PostRequest {
  private final String device;
  private final BatteryInfo battery;
  private final List<WindowEntry> windows;

  public PostRequest(String device, BatteryInfo battery, List<WindowEntry> windows) {
    this.device = device;
    this.battery = battery;
    this.windows = windows;
  }

  public String device() {
    return device;
  }

  public BatteryInfo battery() {
    return battery;
  }

  public List<WindowEntry> windows() {
    return windows;
  }

  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) return false;

    PostRequest request = (PostRequest) o;
    return Objects.equals(device, request.device) && Objects.equals(battery, request.battery) && Objects.equals(windows, request.windows);
  }

  @Override
  public int hashCode() {
    int result = Objects.hashCode(device);
    result = 31 * result + Objects.hashCode(battery);
    result = 31 * result + Objects.hashCode(windows);
    return result;
  }

  @Override
  public String toString() {
    return "PostRequest{" +
      "device='" + device + '\'' +
      ", battery=" + battery +
      ", windows=" + windows +
      '}';
  }
}
