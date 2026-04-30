import { By, Builder, Browser, WebDriver } from 'selenium-webdriver';
import { expect } from 'chai';
import Chrome from 'selenium-webdriver/chrome';
import edge from 'selenium-webdriver/edge';
import Firefox from 'selenium-webdriver/firefox';

const BASE_URL = 'https://kahoot-quiz-tests.onrender.com';

function createDriver(browser: string): WebDriver {
  const options = {
    [Browser.CHROME]: () => new Chrome.Options().addArguments('--headless=new'),
    [Browser.EDGE]: () => new edge.Options().addArguments('--headless=new'),
    [Browser.FIREFOX]: () => new Firefox.Options().addArguments('--headless'),
  };

  const builder = new Builder().forBrowser(browser);
  if (options[browser]) {
    const browserOptions = options[browser]();
    if (browser === Browser.CHROME) builder.setChromeOptions(browserOptions as Chrome.Options);
    if (browser === Browser.EDGE) builder.setEdgeOptions(browserOptions as edge.Options);
    if (browser === Browser.FIREFOX) builder.setFirefoxOptions(browserOptions as Firefox.Options);
  }

  return builder.build();
}

function runTests(browser: string) {
  describe(`${browser} tests`, () => {
    let driver: WebDriver;

    before(async () => {
      driver = createDriver(browser);
      await driver.manage().setTimeouts({ implicit: 7000 });
    });

    after(async () => {
      await driver.quit();
    });

    beforeEach(async () => {
      await driver.get(BASE_URL);
    });

    it('Should have the correct page title', async () => {
      const title = await driver.getTitle();
      expect(title).to.equal('Kahoot Quiz');
    });

    it('Should navigate to the StudentJoin page and display the correct heading', async () => {
      await driver.findElement(By.id("student-button")).click();
      const heading = await driver.findElement(By.id("student-join-heading"));
      const headingText = await heading.getText();
      expect(headingText).to.equal('Entrar no Quiz');
    });

    it('Should show a quiz finalized message after entering a valid PIN and username', async () => {
      const pin = '128209';
      const username = 'Luiz Henrique';

      await driver.findElement(By.id("student-button")).click();

      const pinInput = await driver.findElement(By.id("pin-input"));
      const nameInput = await driver.findElement(By.id("name-input"));
      const joinButton = await driver.findElement(By.id("join-button"));

      await pinInput.sendKeys(pin);
      await nameInput.sendKeys(username);
      await joinButton.click();
      await driver.manage().setTimeouts({implicit: 4000});
      const finalizedMessage = await driver.findElement(By.id("message"));
      const messageText = await finalizedMessage.getText();
      expect(messageText).to.equal("Quiz Finalizado!");
    });

    it('Should show an invalid PIN message', async () => {
      const pin = '111111';
      const username = 'Test User';

      await driver.findElement(By.id('student-button')).click();

      const pinInput = await driver.findElement(By.id('pin-input'));
      const nameInput = await driver.findElement(By.id('name-input'));
      const joinButton = await driver.findElement(By.id('join-button'));

      await pinInput.sendKeys(pin);
      await nameInput.sendKeys(username);
      await joinButton.click();
      await driver.manage().setTimeouts({implicit: 1000});
      const invalidPinMessage = await driver.findElement(By.id("error"));
      const messageText = await invalidPinMessage.getText();
      expect(messageText).to.equal('PIN inválido ou sessão não encontrada.');
    });
  });
}

describe('Regression Tests', () => {
  runTests(Browser.CHROME);
  runTests(Browser.EDGE);
  runTests(Browser.FIREFOX);
});
