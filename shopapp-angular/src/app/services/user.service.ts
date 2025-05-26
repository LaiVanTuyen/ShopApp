import {Inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HttpUtilService} from './http.util.service';
import {DOCUMENT} from '@angular/common';
import { Observable } from 'rxjs';
import { RegisterDTO } from '../dtos/user/register.dto';
import { LoginDTO } from '../dtos/user/login.dto';
import { UpdateUserDTO } from '../dtos/user/update.user.dto';
import { UserResponse } from '../responses/user/user.response';
import { ValidationException } from '../exceptions/validation.exception';
import { validate } from 'class-validator';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
  localStorage?:Storage;

  private apiConfig = {
    headers: this.httpUtilService.createHeaders(),
  }

  constructor(
    private http:HttpClient,
    private httpUtilService: HttpUtilService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.localStorage = document.defaultView?.localStorage;
  }

  register(registerDTO: RegisterDTO):Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }

  login(loginDTO: LoginDTO): Observable<any> {    
    return this.http.post(this.apiLogin, loginDTO, this.apiConfig);
  }

  getUserDetail(token: string) {
    return this.http.get(this.apiUserDetail, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }

  /**
   * Retrieves the user information from browser's localStorage
   * This function is used to:
   * 1. Check if user is logged in
   * 2. Get saved user information after page refresh
   * 3. Maintain user session state
   * 
   * @returns {UserResponse | null} Returns UserResponse object if user data exists in localStorage,
   *                               otherwise returns null
   */
  getUserResponseFromLocalStorage(): UserResponse | null {
    // Check if localStorage is available
    if (!this.localStorage) {
      console.warn('localStorage is not available in this environment');
      return null;
    }

    try {
      // Get user data from localStorage
      const userResponseJSON = this.localStorage.getItem('user');
      
      // Check if data exists
      if (!userResponseJSON) {
        return null;
      }

      // Parse JSON to object
      const parsedData = JSON.parse(userResponseJSON);
      
      // Validate required fields
      if (!this.isValidUserData(parsedData)) {
        console.error('Invalid user data structure in localStorage');
        return null;
      }

      // Convert date string to Date object
      if (parsedData.date_of_birth) {
        parsedData.date_of_birth = new Date(parsedData.date_of_birth);
      }

      return parsedData as UserResponse;
    } catch (error) {
      console.error('Error retrieving user data:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Validates if the data has all required fields with correct types
   * @param data - The data to validate
   * @returns boolean indicating if data is valid
   */
  private isValidUserData(data: any): data is UserResponse {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.id === 'number' &&
      typeof data.fullname === 'string' &&
      typeof data.address === 'string' &&
      typeof data.is_active === 'boolean' &&
      typeof data.facebook_account_id === 'number' &&
      typeof data.google_account_id === 'number' &&
      data.role && typeof data.role === 'object'
    );
  }

  updateUserDetail(token: string, updateUserDTO: UpdateUserDTO){
    let userResponse = this.getUserDetail(token);
  }

}
