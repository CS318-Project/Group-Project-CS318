package com.personal.expense.service;

import com.personal.expense.model.Category;
import com.personal.expense.model.Income;
import com.personal.expense.repository.CategoryRepository;
import com.personal.expense.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<Income> findByUserId(Long userId) {
        return incomeRepository.findByUserIdOrderByDateDesc(userId);
    }

    @Override
    public Income findById(@NonNull Long id) {
        return incomeRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Income save(@NonNull Income income) {
        Category category = income.getCategory();
        if (category != null && category.getId() == null) {
            Category existingCategory = categoryRepository.findByName(category.getName())
                    .orElseGet(() -> categoryRepository.save(category));
            income.setCategory(existingCategory);
        }
        return incomeRepository.save(income);
    }

    @Override
    @Transactional
    public void deleteById(@NonNull Long id) {
        incomeRepository.deleteById(id);
    }

    @Override
    public List<Income> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return incomeRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }
}
