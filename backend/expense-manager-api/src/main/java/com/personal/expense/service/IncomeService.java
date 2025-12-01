package com.personal.expense.service;

import com.personal.expense.model.Income;

import java.time.LocalDate;
import java.util.List;

public interface IncomeService {
    List<Income> findByUserId(Long userId);

    Income findById(Long id);

    Income save(Income income);

    void deleteById(Long id);

    List<Income> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);
}
