/**
 * Главная страница админ-панели с роутингом
 */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Dashboard from './Dashboard';
import QuizzesPage from './QuizzesPage';
import UsersPage from './UsersPage';
import QuizBuilder from './QuizBuilder';
import AnalyticsListPage from './AnalyticsListPage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import QuizLinksPage from './QuizLinksPage';

export default function AdminPage({ user }) {
  // Убрали проверку прав - она есть на бэкенде
  // Если пользователь не админ, API вернет 401/403 и покажет ошибку
  
  return (
    <AdminLayout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quizzes/create" element={<QuizBuilder />} />
        <Route path="/quizzes/:id/edit" element={<QuizBuilder />} />
        <Route path="/quizzes/:id/links" element={<QuizLinksPage />} />
        <Route path="/analytics" element={<AnalyticsListPage />} />
        <Route path="/analytics/:id" element={<AnalyticsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
