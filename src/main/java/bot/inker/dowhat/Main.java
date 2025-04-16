package bot.inker.dowhat;

import bot.inker.dowhat.entity.BatteryInfo;
import bot.inker.dowhat.entity.DeviceResponse;
import bot.inker.dowhat.entity.PostRequest;
import bot.inker.dowhat.entity.WindowEntry;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.undertow.Undertow;
import io.undertow.predicate.Predicate;
import io.undertow.server.RoutingHandler;
import io.undertow.server.handlers.resource.ClassPathResourceManager;
import io.undertow.server.handlers.resource.ResourceHandler;
import io.undertow.util.Headers;
import io.undertow.util.PathTemplateMatch;
import io.undertow.util.StatusCodes;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.io.IoBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public final class Main {
  private static final String TOKEN_DIGEST = "46f5a92e7766ffce7de6d1d0792047c589f311a8dc933b5ca96cb256f2c30a0f";
  private static final Gson gson = new GsonBuilder()
    .setPrettyPrinting()
    .create();

  private static final Logger logger;

  static {
    System.setProperty("java.util.logging.manager", "org.apache.logging.log4j.jul.LogManager");

    org.apache.logging.log4j.Logger stdoutLogger = LogManager.getLogger("STDOUT");
    System.setOut(IoBuilder.forLogger(stdoutLogger)
      .setLevel(Level.INFO)
      .buildPrintStream());

    org.apache.logging.log4j.Logger stderrLogger = LogManager.getLogger("STDERR");
    System.setErr(IoBuilder.forLogger(stderrLogger)
      .setLevel(Level.WARN)
      .buildPrintStream());

    logger = LoggerFactory.getLogger(Main.class);
  }

  private static final Map<String, DataManager> dataManagers = new ConcurrentHashMap<>();

  private static DataManager getDataManager(String device) {
    return dataManagers.computeIfAbsent(device, DataManager::new);
  }

  private static String digest(String token) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] digest = md.digest(token.getBytes(StandardCharsets.UTF_8));
      StringBuilder hexString = new StringBuilder();
      for (byte b : digest) {
        String hex = Integer.toHexString(0xFF & b);
        if (hex.length() == 1) {
          hexString.append('0');
        }
        hexString.append(hex);
      }
      return hexString.toString();
    } catch (Exception e) {
      throw new RuntimeException("Error generating token digest", e);
    }
  }

  private static DeviceResponse createResponse(DataManager dataManager) {
    Optional<DataManager.LastData> data = dataManager.get();
    Optional<WindowEntry> openedWindows = data.flatMap(it -> it.windows().stream()
      .filter(WindowEntry::isWindowsForced)
      .findFirst());

    return data.map(lastData ->
      new DeviceResponse(dataManager.device(), true, lastData.timestamp(),
        openedWindows.map(it -> it.program() + " - " + it.title()).orElse(null),
        data.stream().flatMap(it -> it.windows().stream())
          .map(it -> it.program() + " - " + it.title())
          .toList(),
        data.map(DataManager.LastData::battery)
          .map(BatteryInfo::percentage)
          .orElse(-1)
      )
    ).orElseGet(() ->
      new DeviceResponse(dataManager.device(), false, 0, null, Collections.emptyList(), -1)
    );
  }

  public static void main(String[] args) {
    getDataManager("MacBook");
    getDataManager("Windows");
    getDataManager("Android");

    ResourceHandler resourceHandler = new ResourceHandler(new ClassPathResourceManager(
      Main.class.getClassLoader(), "public"
    ));

    RoutingHandler routingHandler = new RoutingHandler();
    routingHandler.setFallbackHandler(resourceHandler);
    routingHandler.setInvalidMethodHandler(resourceHandler);

    Predicate requireAuthorize = exchange -> {
      String auth = exchange.getRequestHeaders().getFirst(Headers.AUTHORIZATION);
      if (auth == null || !auth.startsWith("Bearer ")) {
        return false;
      }
      String token = auth.substring("Bearer ".length());
      return digest(token).equals(TOKEN_DIGEST);
    };

    routingHandler.post("/cgi-bin/post", requireAuthorize,exchange ->
      exchange.getRequestReceiver().receiveFullString((exchange1, message) -> {
        try {
          PostRequest request = gson.fromJson(message, PostRequest.class);
          dataManagers.computeIfAbsent(request.device(), DataManager::new).post(request);
          exchange.setStatusCode(StatusCodes.NO_CONTENT);
          exchange.endExchange();
        } catch (Exception e) {
          e.printStackTrace();
          exchange.setStatusCode(500);
          exchange.getResponseSender().send("Internal server error");
        }
      }, StandardCharsets.UTF_8));

    routingHandler.get("/cgi-bin/all", exchange -> {
      try {
        StringBuilder response = new StringBuilder("[");
        for (Map.Entry<String, DataManager> entry : dataManagers.entrySet()) {
          DataManager dataManager = entry.getValue();
          DeviceResponse deviceResponse = createResponse(dataManager);
          response.append(gson.toJson(deviceResponse)).append(",");
        }
        if (response.length() > 1) {
          response.setLength(response.length() - 1);
        }
        response.append("]");

        exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "application/json; charset=utf-8");
        exchange.getResponseSender().send(response.toString());
        exchange.endExchange();
      } catch (Exception e) {
        e.printStackTrace();
        exchange.setStatusCode(500);
        exchange.getResponseSender().send("Internal server error");
      }
    });

    routingHandler.get("/cgi-bin/get/{device}", exchange -> {
      try {
        String device = exchange.getAttachment(PathTemplateMatch.ATTACHMENT_KEY)
          .getParameters()
          .get("device");
        if (device == null) {
          exchange.setStatusCode(400);
          exchange.getResponseSender().send("Device not specified");
          return;
        }

        DataManager dataManager = getDataManager(device);
        DeviceResponse response = createResponse(dataManager);

        exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "application/json; charset=utf-8");
        exchange.getResponseSender().send(gson.toJson(response));
        exchange.endExchange();
      } catch (Exception e) {
        e.printStackTrace();
        exchange.setStatusCode(500);
        exchange.getResponseSender().send("Internal server error");
      }
    });

    Undertow.builder()
      .addHttpListener(8001, "0.0.0.0")
      .setHandler(exchange -> {
        if (exchange.getRequestPath().startsWith("/cgi-bin/")) {
          routingHandler.handleRequest(exchange);
        } else {
          resourceHandler.handleRequest(exchange);
        }
      })
      .build()
      .start();
  }
}