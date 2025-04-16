package bot.inker.dowhat.entity;

import java.util.Objects;

public final class WindowEntry {
  private final int pid;
  private final String program;
  private final String title;
  private final boolean isWindowsForced;

  public WindowEntry(int pid, String program, String title, boolean isWindowsForced) {
    this.pid = pid;
    this.program = program;
    this.title = title;
    this.isWindowsForced = isWindowsForced;
  }

  public String program() {
    return program;
  }

  public int pid() {
    return pid;
  }

  public String title() {
    return title;
  }

  public boolean isWindowsForced() {
    return isWindowsForced;
  }

  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) return false;

    WindowEntry that = (WindowEntry) o;
    return pid == that.pid && isWindowsForced == that.isWindowsForced && Objects.equals(program, that.program) && Objects.equals(title, that.title);
  }

  @Override
  public int hashCode() {
    int result = pid;
    result = 31 * result + Objects.hashCode(program);
    result = 31 * result + Objects.hashCode(title);
    result = 31 * result + Boolean.hashCode(isWindowsForced);
    return result;
  }

  @Override
  public String toString() {
    return "WindowEntry{" +
      "pid=" + pid +
      ", program='" + program + '\'' +
      ", title='" + title + '\'' +
      ", isWindowsForced=" + isWindowsForced +
      '}';
  }
}
