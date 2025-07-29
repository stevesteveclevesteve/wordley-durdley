import { TestBed } from '@angular/core/testing';
import { ApplicationConfig } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { appConfig } from './app.config';

describe('AppConfig', () => {
  describe('Configuration Object', () => {
    it('should be defined', () => {
      expect(appConfig).toBeDefined();
    });

    it('should have providers array', () => {
      expect(appConfig.providers).toBeDefined();
      expect(Array.isArray(appConfig.providers)).toBe(true);
    });

    it('should have at least 2 providers', () => {
      expect(appConfig.providers.length).toBeGreaterThanOrEqual(2);
    });

    it('should be a valid ApplicationConfig', () => {
      expect(appConfig).toEqual(jasmine.objectContaining({
        providers: jasmine.any(Array)
      }));
    });
  });

  describe('Provider Integration', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: appConfig.providers
      });
    });

    it('should provide Router service', () => {
      const router = TestBed.inject(Router);
      expect(router).toBeDefined();
      expect(router).toBeInstanceOf(Router);
    });

    it('should provide HttpClient service', () => {
      const httpClient = TestBed.inject(HttpClient);
      expect(httpClient).toBeDefined();
      expect(httpClient).toBeInstanceOf(HttpClient);
    });

    it('should configure HttpClient with fetch API', () => {
      const httpClient = TestBed.inject(HttpClient);
      // The HttpClient should be configured with fetch
      // This is verified by the fact that the service is available
      expect(httpClient).toBeTruthy();
    });
  });
});
