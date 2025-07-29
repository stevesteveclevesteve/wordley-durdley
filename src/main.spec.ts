import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

describe('Main Bootstrap', () => {
  let bootstrapSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    bootstrapSpy = spyOn({ bootstrapApplication }, 'bootstrapApplication');
    consoleErrorSpy = spyOn(console, 'error');
  });

  describe('Bootstrap Function', () => {
    it('should call bootstrapApplication with AppComponent and appConfig', async () => {
      // Mock successful bootstrap
      const mockBootstrapPromise = Promise.resolve({} as any);
      bootstrapSpy.and.returnValue(mockBootstrapPromise);

      // Import and execute main.ts logic
      await bootstrapApplication(AppComponent, appConfig)
        .catch((err) => console.error(err));

      expect(bootstrapSpy).toHaveBeenCalledWith(AppComponent, appConfig);
      expect(bootstrapSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle bootstrap errors by logging to console', async () => {
      const testError = new Error('Bootstrap failed');
      const mockBootstrapPromise = Promise.reject(testError);
      bootstrapSpy.and.returnValue(mockBootstrapPromise);

      await bootstrapApplication(AppComponent, appConfig)
        .catch((err) => console.error(err));

      // Wait for promise to resolve
      await mockBootstrapPromise.catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    });

    it('should pass correct component type', () => {
      const mockBootstrapPromise = Promise.resolve({} as any);
      bootstrapSpy.and.returnValue(mockBootstrapPromise);

      bootstrapApplication(AppComponent, appConfig)
        .catch((err) => console.error(err));

      const firstArg = bootstrapSpy.calls.mostRecent().args[0];
      expect(firstArg).toBe(AppComponent);
    });

    it('should pass correct configuration object', () => {
      const mockBootstrapPromise = Promise.resolve({} as any);
      bootstrapSpy.and.returnValue(mockBootstrapPromise);

      bootstrapApplication(AppComponent, appConfig)
        .catch((err) => console.error(err));

      const secondArg = bootstrapSpy.calls.mostRecent().args[1];
      expect(secondArg).toBe(appConfig);
    });
  });

  describe('Error Handling', () => {
    it('should not throw unhandled promise rejection', (done) => {
      const testError = new Error('Test error');
      const mockBootstrapPromise = Promise.reject(testError);
      bootstrapSpy.and.returnValue(mockBootstrapPromise);

      bootstrapApplication(AppComponent, appConfig)
        .catch((err) => {
          console.error(err);
          expect(err).toBe(testError);
          done();
        });
    });

    it('should continue execution after error', async () => {
      const testError = new Error('Test error');
      const mockBootstrapPromise = Promise.reject(testError);
      bootstrapSpy.and.returnValue(mockBootstrapPromise);

      let errorHandled = false;

      await bootstrapApplication(AppComponent, appConfig)
        .catch((err) => {
          console.error(err);
          errorHandled = true;
        });

      expect(errorHandled).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle different error types', async () => {
      const testCases = [
        new Error('Standard error'),
        'String error',
        { message: 'Object error' },
        null,
        undefined
      ];

      for (const testError of testCases) {
        consoleErrorSpy.calls.reset();
        bootstrapSpy.and.returnValue(Promise.reject(testError));

        await bootstrapApplication(AppComponent, appConfig)
          .catch((err) => console.error(err));

        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
      }
    });
  });

  describe('Bootstrap Success', () => {
    it('should not call console.error on successful bootstrap', async () => {
      const mockApp = {
        components: [AppComponent],
        injector: {}
      };
      const mockBootstrapPromise = Promise.resolve(mockApp);
      bootstrapSpy.and.returnValue(mockBootstrapPromise);

      await bootstrapApplication(AppComponent, appConfig)
        .catch((err) => console.error(err));

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return application reference on success', async () => {
      const mockApp = {
        components: [AppComponent],
        injector: {}
      };
      const mockBootstrapPromise = Promise.resolve(mockApp);
      bootstrapSpy.and.returnValue(mockBootstrapPromise);

      const result = await bootstrapApplication(AppComponent, appConfig)
        .catch((err) => console.error(err));

      expect(result).toBe(mockApp);
    });
  });
});
