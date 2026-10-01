plugins {
    java
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.seleniumhq.selenium:selenium-java:4.35.0")
    testImplementation("org.testng:testng:7.12.0")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
}

tasks.test {
    useTestNG()
    systemProperty("baseUrl", System.getenv("BASE_URL") ?: "http://127.0.0.1:3000")
    systemProperty("testUsername", System.getenv("TEST_USERNAME") ?: "manager")
    systemProperty("testPassword", System.getenv("TEST_PASSWORD") ?: "GymManager2026!")
    systemProperty("browser", System.getenv("BROWSER") ?: "chrome")
    systemProperty("headless", System.getenv("HEADLESS") ?: "true")
    systemProperty("testDelayMs", System.getenv("TEST_DELAY_MS") ?: "0")
    testLogging {
        events("passed", "skipped", "failed")
    }
}
