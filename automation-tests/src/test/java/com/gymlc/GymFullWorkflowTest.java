package com.gymlc;

import java.time.Duration;
import java.util.UUID;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.Reporter;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class GymFullWorkflowTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private String memberName;
    private String memberPhone;

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        if (Boolean.parseBoolean(System.getProperty("headless", "true"))) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1440,1000");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test(description = "FULL-01: Đăng ký, mua gói, thanh toán, check-in/out, gia hạn và xem báo cáo")
    public void completeMemberJourney() {
        String id = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        memberName = "System Flow " + id;
        memberPhone = "09" + String.valueOf(System.currentTimeMillis()).substring(5, 13);
        String username = "flow" + id;
        String email = username + "@example.test";

        registerMember(username, email);
        login("manager", "GymManager2026!");
        openSection("Hội viên");
        findMember();
        viewMemberInformation();

        Reporter.log("FLOW-04 Chọn khuyến mãi: SKIPPED - hệ thống chưa có chức năng khuyến mãi.", true);
        registerPlan();
        payForPlan();
        checkInAndOut();
        renewMembership();
        openReport();
    }

    private void registerMember(String username, String email) {
        driver.get(baseUrl() + "/login");
        click(By.xpath("//button[normalize-space()='Đăng ký tài khoản hội viên']"));
        type(By.name("name"), memberName);
        type(By.name("email"), email);
        type(By.name("phone"), memberPhone);
        type(By.name("username"), username);
        type(By.name("password"), "SystemFlow2026!");
        type(By.name("confirm_password"), "SystemFlow2026!");
        click(By.xpath("//button[normalize-space()='Đăng ký']"));
        wait.until(driver -> !driver.findElements(By.cssSelector("[role='status']")).isEmpty()
            || !driver.findElements(By.cssSelector("[role='alert']")).isEmpty());
        var errors = driver.findElements(By.cssSelector("[role='alert']"));
        if (!errors.isEmpty() && errors.get(0).isDisplayed()) {
            Assert.fail("Đăng ký hội viên thất bại: " + errors.get(0).getText());
        }
        pause();
    }

    private void login(String username, String password) {
        if (!driver.getCurrentUrl().endsWith("/login")) {
            driver.get(baseUrl() + "/login");
        }
        type(By.name("username"), username);
        type(By.name("password"), password);
        click(By.xpath("//button[normalize-space()='Đăng nhập']"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[normalize-space()='Đăng xuất']")));
        pause();
    }

    private void openSection(String label) {
        click(By.xpath("//button[normalize-space()='" + label + "']"));
        pause();
    }

    private void findMember() {
        driver.get(baseUrl() + "/#members");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("input[aria-label='Tìm hội viên']")));
        type(By.cssSelector("input[aria-label='Tìm hội viên']"), memberName);
        var memberButton = By.xpath("//button[normalize-space()='" + memberName + "']");
        try {
            wait.until(ExpectedConditions.elementToBeClickable(memberButton));
        } catch (org.openqa.selenium.TimeoutException exception) {
            String body = driver.findElement(By.tagName("body")).getText();
            Assert.fail("Không tìm thấy hội viên mới: " + memberName
                + "; URL=" + driver.getCurrentUrl()
                + "; Nội dung=" + body.substring(0, Math.min(body.length(), 1500)));
        }
        pause();
    }

    private void viewMemberInformation() {
        click(By.xpath("//button[normalize-space()='" + memberName + "']"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("dialog")));
        Assert.assertTrue(driver.findElement(By.tagName("dialog")).getText().contains(memberName));
        click(By.xpath("//button[normalize-space()='Đóng']"));
        pause();
    }

    private void registerPlan() {
        openSection("Đăng ký gói");
        click(By.xpath("//button[normalize-space()='Thêm đăng ký']"));
        var dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='dialog']")));
        typeIn(dialog, 0, "REG" + System.currentTimeMillis());
        selectContaining(dialog, 0, memberName);
        selectFirstAvailable(dialog, 1);
        clickIn(dialog, By.xpath(".//button[normalize-space()='Lưu']"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("[role='dialog']")));
        pause();
    }

    private void payForPlan() {
        openSection("Thanh toán");
        click(By.xpath("//button[normalize-space()='Thêm thanh toán']"));
        var dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='dialog']")));
        typeIn(dialog, 0, "PAY" + System.currentTimeMillis());
        selectContaining(dialog, 0, memberName);
        clickIn(dialog, By.xpath(".//button[normalize-space()='Lưu']"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("[role='dialog']")));
        pause();
    }

    private void checkInAndOut() {
        openSection("Điểm danh");
        type(By.cssSelector("input[aria-label='Tìm hội viên điểm danh']"), memberName);
        click(By.xpath("//button[normalize-space()='Check-in']"));
        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[normalize-space()='Check-out']")));
        pause();
        click(By.xpath("//button[normalize-space()='Check-out']"));
        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[normalize-space()='Check-in']")));
        pause();
    }

    private void renewMembership() {
        openSection("Hội viên");
        type(By.cssSelector("input[aria-label='Tìm hội viên']"), memberName);
        click(By.xpath("//button[normalize-space()='Gia hạn']"));
        var dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("dialog")));
        selectFirstAvailable(dialog, 0);
        clickIn(dialog, By.xpath(".//button[normalize-space()='Xác nhận đã thu tiền']"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.tagName("dialog")));
        pause();
    }

    private void openReport() {
        openSection("Báo cáo");
        Assert.assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h2[normalize-space()='Báo cáo hoạt động']"))).isDisplayed());
        pause();
    }

    private void selectContaining(org.openqa.selenium.WebElement root, int index, String text) {
        var select = root.findElements(By.tagName("select")).get(index);
        new Select(select).getOptions().stream()
                .filter(option -> option.getText().contains(text))
                .findFirst()
                .ifPresentOrElse(option -> new Select(select).selectByVisibleText(option.getText()),
                        () -> Assert.fail("Không tìm thấy lựa chọn " + text));
        pause();
    }

    private void selectFirstAvailable(org.openqa.selenium.WebElement root, int index) {
        var select = root.findElements(By.tagName("select")).get(index);
        var options = new Select(select).getOptions();
        Assert.assertTrue(options.size() > 1, "Không có lựa chọn tại select index " + index);
        new Select(select).selectByIndex(1);
        pause();
    }

    private void clickIn(org.openqa.selenium.WebElement root, By locator) {
        var element = wait.until(ExpectedConditions.elementToBeClickable(root.findElement(locator)));
        ((org.openqa.selenium.JavascriptExecutor) driver)
                .executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        element.click();
        pause();
    }

    private void typeIn(org.openqa.selenium.WebElement root, int index, String value) {
        var input = root.findElements(By.cssSelector("input")).get(index);
        input.clear();
        input.sendKeys(value);
        pause();
    }

    private void click(By locator) {
        var element = wait.until(ExpectedConditions.elementToBeClickable(locator));
        ((org.openqa.selenium.JavascriptExecutor) driver)
                .executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        element.click();
        pause();
    }

    private void type(By locator, String value) {
        var element = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        element.clear();
        element.sendKeys(value);
        pause();
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