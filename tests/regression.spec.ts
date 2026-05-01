import { By, Builder, Browser, WebDriver, until } from 'selenium-webdriver';
import { expect } from 'chai';
import * as Chrome from 'selenium-webdriver/chrome';
import * as Edge from 'selenium-webdriver/edge';
import * as Firefox from 'selenium-webdriver/firefox';
import * as Safari from 'selenium-webdriver/safari';
import process from 'node:process';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://kahoot-quiz-tests.onrender.com/';
const email = process.env.EMAIL!;
const pass = process.env.PASSWORD!;

async function waitForSite(driver: WebDriver, url: string, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await driver.get(url);
      await driver.wait(until.titleIs('Kahoot Quiz'), 15000);
      return;
    } catch {
      console.log(`Site ainda carregando, tentativa ${i + 1}/${retries}...`);
      await driver.sleep(5000);
    }
  }
  throw new Error('Site não ficou disponível após todas as tentativas');
}

async function Auth(Email: string, password: string) {
  const auth = getAuth();
  connectAuthEmulator(auth, 'http://localhost:9099', {disableWarnings: true});
   try {
    await signInWithEmailAndPassword(auth, Email, password);
  } catch {
    await createUserWithEmailAndPassword(auth, Email, password);
  }
  await signOut(auth);
}

async function setupPinAndUsername(pin: string, username: string, driver: WebDriver) {
  await driver.findElement(By.id('student-button')).click();
  await driver.findElement(By.id('pin-input')).sendKeys(pin);
  await driver.findElement(By.id('name-input')).sendKeys(username);
  await driver.findElement(By.id('join-button')).click();
}

async function createDriver(browser: string): Promise<WebDriver> {
  const builder = new Builder().forBrowser(browser);

  switch (browser) {
    case Browser.CHROME: {
      const options = new Chrome.Options();
      options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
      builder.setChromeOptions(options);
      break;
    }
    case Browser.EDGE: {
      const options = new Edge.Options();
      options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
      builder.setEdgeOptions(options);
      break;
    }
    case Browser.FIREFOX: {
      const options = new Firefox.Options();
      options.addArguments('--headless');
      builder.setFirefoxOptions(options);
      break;
    }
    case Browser.SAFARI: {
      const options = new Safari.Options();
      builder.setSafariOptions(options);
      break;
    }
  }

  return builder.build();
}

function runTests(browser: string) {
  describe(`${browser} tests`, () => {
    let driver: WebDriver;

    before(async () => {
      driver = await createDriver(browser);
      await driver.manage().setTimeouts({ implicit: 10000 });
      await waitForSite(driver, BASE_URL);
    });

    after(async () => {
      await driver.quit();
    });

    beforeEach(async () => {
      await waitForSite(driver, BASE_URL);
    });

    it('Should have the correct page title', async () => {
      const title = await driver.getTitle();
      expect(title).to.equal('Kahoot Quiz');
    });

    it('Should navigate to the StudentJoin page and display the correct heading', async () => {
      await driver.findElement(By.id('student-button')).click();
      const heading = await driver.findElement(By.id('student-join-heading'));
      expect(await heading.getText()).to.equal('Entrar no Quiz');
    });

    it('Should show a quiz finalized message after entering a valid PIN and username', async () => {
      await setupPinAndUsername('128209', 'Luiz Henrique', driver);
      await driver.manage().setTimeouts({ implicit: 4000 });
      const messageText = await driver.findElement(By.id('message'))
      const msg = await messageText.getText();
      expect(msg).to.equal('Quiz Finalizado!');
    });

    it('Should show an invalid PIN message', async () => {
      await setupPinAndUsername('111111', 'Test User', driver);
      await driver.manage().setTimeouts({ implicit: 1000 });
      const messageText = await driver.findElement(By.id('error'))
      const msg = await messageText.getText();
      expect(msg).to.equal('PIN inválido ou sessão não encontrada.');
    });

    it('Button Entrar Jogo is disabled in only pin input', async () => {
      await driver.findElement(By.id('student-button')).click();
      await driver.findElement(By.id('pin-input')).sendKeys('1111');
      const enabled = await driver.findElement(By.id('join-button')).isEnabled();
      expect(enabled).to.be.false;
    });

    it('Button Entrar Jogo is disabled in only pin username', async () => {
      await driver.findElement(By.id('student-button')).click();
      await driver.findElement(By.id('name-input')).sendKeys('Carlos');
      const enabled = await driver.findElement(By.id('join-button')).isEnabled();
      expect(enabled).to.be.false;
    });

    it('Button Entrar Jogo is disabled without username and pin', async () => {
      await driver.findElement(By.id('student-button')).click();
      const enabled = await driver.findElement(By.id('join-button')).isEnabled();
      expect(enabled).to.be.false;
    });

    it('Button Entrar jogo is enabled', async () => {
      await driver.findElement(By.id('student-button')).click();
      await driver.findElement(By.id('pin-input')).sendKeys('111111');
      await driver.findElement(By.id('name-input')).sendKeys('Test User');
      const enabled = await driver.findElement(By.id('join-button')).isEnabled();
      expect(enabled).to.be.true;
    });

    it('Should back in previous page', async () => {
      await driver.findElement(By.id('student-button')).click();
      const headingText = await driver.findElement(By.id('student-join-heading')).getText();
      expect(headingText).to.equal('Entrar no Quiz');
      await driver.findElement(By.id('voltar')).click();
      const msg = await driver.findElement(By.id('textoPrincipal')).getText();
      expect(msg.toUpperCase()).to.equal('ALGORITMOS LMS GAMIFICADO');
    });

    describe('Teacher', () => {
      describe('Main text of teacher option', () => {
        it('See the main text of button', async () => {
          await driver.findElement(By.id('teacher-button')).click();
          const msg = await driver.findElement(By.id('text-professor')).getText();
          expect(msg).to.equal('Acesso do Professor');
        });
      });

      it('Login test', async () => {
        await Auth(email, pass);
      });

      describe('Save question', () => {
        it('Save true or false question', async () => {
          await Auth(email, pass);
        });

        it('Save correspondence question', async () => {
          await Auth(email, pass);
        });

        it('Save multiple choices question', async () => {
          await Auth(email, pass);
        });
      });

      it('Save quiz', async () => {
        await Auth(email, pass);
      });
    });
  });
}

describe('Regression Tests', () => {
  runTests(Browser.CHROME);
  runTests(Browser.EDGE);
  runTests(Browser.FIREFOX);
  if (process.platform === 'darwin') runTests(Browser.SAFARI);
});
