plugins {
  id("java")
  id("org.springframework.boot") version "3.4.3"
}

group = "bot.inker.krypix"
version = "1.0-SNAPSHOT"

repositories {
  mavenCentral()
}

springBoot {
  mainClass.set("bot.inker.dowhat.Main")
}

sourceSets {
  main {
    resources {
      srcDir("html/dist")
    }
  }
}

dependencies {
  implementation("io.undertow:undertow-core:2.3.18.Final")
  implementation("com.google.code.gson:gson:2.12.1")

  implementation("org.slf4j:slf4j-api:2.0.16")
  implementation("org.apache.logging.log4j:log4j-core:2.20.0")
  implementation("org.apache.logging.log4j:log4j-slf4j2-impl:2.20.0")
  implementation("org.apache.logging.log4j:log4j-jul:2.20.0")
  implementation("org.apache.logging.log4j:log4j-iostreams:2.20.0")

  testImplementation(platform("org.junit:junit-bom:5.10.0"))
  testImplementation("org.junit.jupiter:junit-jupiter")
}

tasks.create<Exec>("buildFrontend") {
  workingDir("html")
  commandLine("/usr/bin/env", "npm", "run", "build")
}

tasks.processResources {
  dependsOn(tasks["buildFrontend"])
}

tasks.test {
  useJUnitPlatform()
}