package com.personal.expense.controller;

import com.personal.expense.model.Expense;
import com.personal.expense.model.Income;
import com.personal.expense.model.User;
import com.personal.expense.repository.ExpenseRepository;
import com.personal.expense.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    @GetMapping("/daily")
    public Map<LocalDate, List<Expense>> getDailyReport(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        LocalDate today = LocalDate.now();
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(user.getId(), today, today);
        return expenses.stream().collect(Collectors.groupingBy(Expense::getDate));
    }

    @GetMapping("/weekly")
    public Map<LocalDate, List<Expense>> getWeeklyReport(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusWeeks(1);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(user.getId(), weekAgo, today);
        return expenses.stream().collect(Collectors.groupingBy(Expense::getDate));
    }

    @GetMapping("/monthly")
    public Map<LocalDate, List<Expense>> getMonthlyReport(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        LocalDate today = LocalDate.now();
        LocalDate monthAgo = today.minusMonths(1);
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(user.getId(), monthAgo, today);
        return expenses.stream().collect(Collectors.groupingBy(Expense::getDate));
    }

    @GetMapping("/summary")
    public Map<String, BigDecimal> getSummary(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Expense> expenses = expenseRepository.findByUserId(user.getId());
        return expenses.stream().collect(Collectors.groupingBy(expense -> expense.getCategory().getName(),
                Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
    }

    @GetMapping("/income-summary")
    public Map<String, BigDecimal> getIncomeSummary(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Income> incomeList = incomeRepository.findByUserId(user.getId());
        return incomeList.stream().collect(Collectors.groupingBy(income -> income.getCategory().getName(),
                Collectors.mapping(Income::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
    }

    @GetMapping("/balance")
    public Map<String, BigDecimal> getBalance(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Expense> expenses = expenseRepository.findByUserId(user.getId());
        List<Income> incomeList = incomeRepository.findByUserId(user.getId());

        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalIncome = incomeList.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> balance = new HashMap<>();
        balance.put("totalIncome", totalIncome);
        balance.put("totalExpenses", totalExpenses);
        balance.put("netBalance", totalIncome.subtract(totalExpenses));

        return balance;
    }
}