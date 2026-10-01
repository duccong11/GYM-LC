package com.gymlc;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class GymLoginTest {
    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeMethod
    public void setUp() {
        driver = createDriver(System.getProperty("browser", "chrome"));
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get(baseUrl() + "/login");
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test(description = "Đăng nhập bằng tài khoản demo và mở được màn hình quản lý")
    public void loginWithDemoAccount() {
        login(System.getProperty("testUsername", "manager"),
                System.getProperty("testPassword", "GymManager2026!"));

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[normalize-space()='Đăng xuất']")));
        Assert.assertTrue(driver.getCurrentUrl().endsWith("/"),
                "Sau khi đăng nhập phải chuyển về màn hình chính");
    }

    @Test(description = "Sai mật khẩu hiển thị thông báo lỗi và không tạo phiên")
    public void invalidPasswordShowsError() {
        login(System.getProperty("testUsername", "manager"), "wrong-password");

        String error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("[role='alert']"))).getText();
        Assert.assertFalse(error.isBlank(), "Thông báo lỗi không được để trống");
        Assert.assertTrue(driver.getCurrentUrl().endsWith("/login"),
                "Đăng nhập thất bại phải giữ ở trang đăng nhập");
    }

    @Test(description = "Đăng xuất xóa phiên và đưa người dùng về trang đăng nhập")
    public void logoutReturnsToLogin() {
        login(System.getProperty("testUsername", "manager"),
                System.getProperty("testPassword", "GymManager2026!"));
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Đăng xuất']"))).click();

        wait.until(ExpectedConditions.urlContains("/login"));
        Assert.assertTrue(driver.getCurrentUrl().endsWith("/login"));
    }

    private void login(String username, String password) {
        driver.findElement(By.cssSelector("input[name='username']")).sendKeys(username);
        pause();
        driver.findElement(By.cssSelector("input[name='password']")).sendKeys(password);
        pause();
        driver.findElement(By.xpath("//button[normalize-space()='Đăng nhập']")).click();
        pause();
    }

    private WebDriver createDriver(String browser) {
        boolean headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
        if ("edge".equalsIgnoreCase(browser)) {
            EdgeOptions options = new EdgeOptions();
            if (headless) {
                options.addArguments("--headless=new");
            }
            options.addArguments("--window-size=1440,1000");
            return new EdgeDriver(options);
        }

        ChromeOptions options = new ChromeOptions();
        if (headless) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1440,1000");
        return new ChromeDriver(options);
    }

    private void pause() {
        long delayMs = Long.parseLong(System.getProperty("testDelayMs", "0"));
        if (delayMs <= 0) {
            return;
        }
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Test bị ngắt trong lúc chờ quan sát.", exception);
        }
    }

    private String baseUrl() {
        return System.getProperty("baseUrl", "http://127.0.0.1:3000");
    }
}
