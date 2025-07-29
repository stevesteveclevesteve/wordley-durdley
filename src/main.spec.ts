import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { of } from 'rxjs';

describe('Main Bootstrap', () => {
  let bootstrapSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    bootstrapSpy = spyOn({ bootstrapApplication }, 'bootstrapApplication');
    consoleErrorSpy = spyOn(console, 'error');
  });

  describe('Error Handling', () => {

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

  });

});
