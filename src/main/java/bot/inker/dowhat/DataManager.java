package bot.inker.dowhat;

import bot.inker.dowhat.entity.BatteryInfo;
import bot.inker.dowhat.entity.PostRequest;
import bot.inker.dowhat.entity.WindowEntry;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

public final class DataManager {
  private static final long EXPIRATION_TIME = 1000 * 60 * 5; // 5 minutes

  private final String device;

  private final AtomicReference<LastData> lastData = new AtomicReference<>(null);

  public DataManager(String device) {
    this.device = device;
  }

  public String device() {
    return device;
  }

  public void post(PostRequest request) {
    lastData.set(new LastData(System.currentTimeMillis(), request.battery(), request.windows()));
  }

  public Optional<LastData> get() {
    LastData data = lastData.get();
    if (data == null) {
      return Optional.empty();
    }

    long currentTime = System.currentTimeMillis();
    if (currentTime - data.timestamp > EXPIRATION_TIME) {
      synchronized (this) {
        data = lastData.get();
        if (data == null) {
          return Optional.empty();
        } else if (currentTime - data.timestamp > EXPIRATION_TIME) {
          lastData.set(null);
          return Optional.empty();
        }
      }
    }

    return Optional.of(data);
  }

  public static final class LastData {
    private final long timestamp;
    private final BatteryInfo battery;
    private final List<WindowEntry> windows;

    private LastData(long timestamp, BatteryInfo battery, List<WindowEntry> windows) {
      this.timestamp = timestamp;
      this.battery = battery;
      this.windows = windows;
    }

    public long timestamp() {
      return timestamp;
    }

    public BatteryInfo battery() {
      return battery;
    }

    public List<WindowEntry> windows() {
      return windows;
    }
  }
}
