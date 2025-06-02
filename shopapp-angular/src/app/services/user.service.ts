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


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
  localStorage?:Storage;

  private apiConfig: { headers: HttpHeaders };

  constructor(
    private http: HttpClient,
    private httpUtilService: HttpUtilService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.localStorage = document.defaultView?.localStorage;
    this.apiConfig = {
      headers: this.httpUtilService.createHeaders()
    };
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

  updateUserDetail(token: string, updateUserDTO: UpdateUserDTO){
    debugger
    let userResponse = this.getUserResponseFromLocalStorage();
    return this.http.put(`${this.apiUserDetail}/${userResponse?.id}`, updateUserDTO, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }

  getUserResponseFromLocalStorage():UserResponse | null {
    try {
      // Retrieve the JSON string from local storage using the key
      const userResponseJSON = this.localStorage?.getItem('user');
      if (userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      // Parse the JSON string back to an object
      const userResponse = JSON.parse(userResponseJSON!);
      console.log('User response retrieved from local storage.');
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return null; // Return null or handle the error as needed
    }
  }

  removeUserFromLocalStorage():void {
    try {
      // Remove the user data from local storage using the key
      this.localStorage?.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
      // Handle the error as needed
    }
  }

}
