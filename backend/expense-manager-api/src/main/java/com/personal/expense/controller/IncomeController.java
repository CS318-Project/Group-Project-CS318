package com.personal.expense.controller;

import com.personal.expense.model.Income;
import com.personal.expense.model.User;
import com.personal.expense.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/income")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<Income>> getAllIncome(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(incomeService.findByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Income> getIncomeById(@PathVariable Long id) {
        Income income = incomeService.findById(id);
        if (income == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(income);
    }

    @PostMapping
    public ResponseEntity<Income> createIncome(@RequestBody Income income) {
        return ResponseEntity.ok(incomeService.save(income));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Income> updateIncome(@PathVariable Long id, @RequestBody Income incomeDetails) {
        Income income = incomeService.findById(id);
        if (income == null) {
            return ResponseEntity.notFound().build();
        }
        income.setDescription(incomeDetails.getDescription());
        income.setAmount(incomeDetails.getAmount());
        income.setDate(incomeDetails.getDate());
        income.setTime(incomeDetails.getTime());
        income.setUser(incomeDetails.getUser());
        income.setCategory(incomeDetails.getCategory());
        return ResponseEntity.ok(incomeService.save(income));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
