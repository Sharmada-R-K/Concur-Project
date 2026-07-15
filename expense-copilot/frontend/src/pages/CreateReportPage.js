import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Button,
  InlineNotification,
  Stack,
  Tile,
} from '@carbon/react';
import { createReport } from '../services/reportService';
import './CreateReportPage.css';

// Employees map to cities and policies — selecting an employee determines
// which card transactions appear (Layer 3 filters by employeeId).
const EMPLOYEES = [
  { value: 'EMP001', label: 'Priya Sharma — Bengaluru (STANDARD)' },
  { value: 'EMP002', label: 'Arjun Mehta — Hyderabad (STANDARD)' },
  { value: 'EMP003', label: 'Kavita Nair — Delhi (EXECUTIVE)' },
  { value: 'EMP004', label: 'Rohan Desai — Bengaluru (EXECUTIVE)' },
];

const EMPLOYEE_POLICY = {
  EMP001: 'STANDARD',
  EMP002: 'STANDARD',
  EMP003: 'EXECUTIVE',
  EMP004: 'EXECUTIVE',
};

const CATEGORIES = [
  { value: 'CONFERENCE_TRADESHOW_CUSTOMER', label: 'Conference/Tradeshow (Customer/Client Related Travel)' },
  { value: 'CONFERENCE_TRADESHOW_NON_CUSTOMER', label: 'Conference/Tradeshow (Non-Customer/Non-Client Related Travel)' },
  { value: 'CORPORATE_EVENT_RECOGNITION', label: 'Corporate Event/Recognition' },
  { value: 'CORPORATE_SERVICE_CORPS', label: 'Corporate Service Corps' },
  { value: 'CUSTOMER_CLIENT_RELATED_TRAVEL', label: 'Customer/Client Related Travel' },
  { value: 'EDUCATION_SEMINAR', label: 'Education/Seminar' },
  { value: 'NON_TRAVEL_EXPENSES', label: 'Non-Travel Expenses' },
];

function CreateReportPage() {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    reportName: '',
    businessPurpose: '',
    employeeId: '',
    policy: '',
    reportCategory: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isValid =
    fields.reportName.trim() &&
    fields.businessPurpose.trim() &&
    fields.employeeId &&
    fields.reportCategory;

  function handleChange(field, value) {
    if (field === 'employeeId') {
      // Auto-set policy based on selected employee
      setFields(prev => ({ ...prev, employeeId: value, policy: EMPLOYEE_POLICY[value] || '' }));
    } else {
      setFields(prev => ({ ...prev, [field]: value }));
    }
    if (error) setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await createReport(fields);
      navigate(`/report/${data.reportId}`, {
        state: {
          reportName: fields.reportName,
          businessPurpose: fields.businessPurpose,
          policy: fields.policy,
          reportCategory: fields.reportCategory,
        }
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create report. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-report-page">
      <div className="create-report-header">
        <p className="create-report-subtitle">Powered by watsonx Orchestrate</p>
        <h1 className="create-report-title">New Expense Report</h1>
        <p className="create-report-desc">
          Fill in the details below to create your expense report. Once created,
          your corporate card transactions will load automatically.
        </p>
      </div>

      <Tile className="create-report-tile">
        <form onSubmit={handleSubmit} noValidate>
          <Stack gap={6}>

            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                hideCloseButton
              />
            )}

            <TextInput
              id="reportName"
              labelText="Report Name"
              placeholder="e.g. Bengaluru Client Visit — July 2026"
              value={fields.reportName}
              onChange={e => handleChange('reportName', e.target.value)}
              required
            />

            <TextArea
              id="businessPurpose"
              labelText="Business Purpose"
              placeholder="e.g. Client meeting with Infosys at Bengaluru office"
              value={fields.businessPurpose}
              onChange={e => handleChange('businessPurpose', e.target.value)}
              rows={3}
              required
            />

            <Select
              id="employeeId"
              labelText="Employee"
              value={fields.employeeId}
              onChange={e => handleChange('employeeId', e.target.value)}
              required
            >
              <SelectItem value="" text="Select an employee" />
              {EMPLOYEES.map(e => (
                <SelectItem key={e.value} value={e.value} text={e.label} />
              ))}
            </Select>

            <Select
              id="reportCategory"
              labelText="Report Category"
              value={fields.reportCategory}
              onChange={e => handleChange('reportCategory', e.target.value)}
              required
            >
              <SelectItem value="" text="Select a category" />
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value} text={c.label} />
              ))}
            </Select>

            <Button
              type="submit"
              disabled={!isValid || loading}
            >
              {loading ? 'Creating report…' : 'Create Expense Report'}
            </Button>

          </Stack>
        </form>
      </Tile>
    </div>
  );
}

export default CreateReportPage;
