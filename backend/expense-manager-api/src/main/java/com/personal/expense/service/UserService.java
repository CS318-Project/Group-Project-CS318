package com.personal.expense.service;

import com.personal.expense.model.SignUpRequest;
import com.personal.expense.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService {
    User signUp(SignUpRequest signUpRequest);
    UserDetailsService userDetailsService();
    User getCurrentUser();
}