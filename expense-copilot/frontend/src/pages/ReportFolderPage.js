import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Tile,
  Tag,
  Button,
} from '@carbon/react';

import AvailableExpensesTable from '../components/AvailableExpensesTable';
import ReceiptUploadArea from '../components/ReceiptUploadArea';
import ProcessedExpensesTable from '../components/ProcessedExpensesTable';
import WarningsList from '../components/WarningsList';
import ChatPanel from '../components/ChatPanel';

import {
  getTransactions,
  processReceipts,
  submitReport,
} from '../services/reportService';

import './ReportFolderPage.css';

const POLICY_LABELS = {
  TRAVEL_AND_EXPENSE_AP_NON_VAT: 'Travel and Expense (AP Non-VAT)',
  STANDARD: 'Standard',
  EXECUTIVE: 'Executive',
};

const CATEGORY_LABELS = {
  CONFERENCE_TRADESHOW_CUSTOMER: 'Conference/Tradeshow (Customer/Client Related Travel)',
  CONFERENCE_TRADESHOW_NON_CUSTOMER: 'Conference/Tradeshow (Non-Customer/Non-Client Related Travel)',
  CORPORATE_EVENT_RECOGNITION: 'Corporate Event/Recognition',
  CORPORATE_SERVICE_CORPS: 'Corporate Service Corps',
  CUSTOMER_CLIENT_RELATED_TRAVEL: 'Customer/Client Related Travel',
  EDUCATION_SEMINAR: 'Education/Seminar',
  NON_TRAVEL_EXPENSES: 'Non-Travel Expenses',
};

function ReportFolderPage() {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Report metadata passed from CreateReportPage via router state
  const meta = location.state || {};

  // ── State ────────────────────────────────────────────────
  const [folderStatus, setFolderStatus] = useState('DRAFT');

  const [transactions, setTransactions]         = useState([]);
  const [txnLoading, setTxnLoading]             = useState(true);
  const [txnError, setTxnError]                 = useState(null);

  const [processedExpenses, setProcessedExpenses] = useState([]);
  const [warnings, setWarnings]                   = useState([]);
  const [processing, setProcessing]               = useState(false);

  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  // Chat messages fed from folder state changes
  const [chatMessages, setChatMessages] = useState([]);

  // ── Helpers ───────────────────────────────────────────────
  const addAgentMessage = useCallback(text => {
    setChatMessages(prev => [
      ...prev,
      { from: 'agent', text, ts: new Date().toLocaleTimeString() }
    ]);
  }, []);

  // ── Load transactions on mount ────────────────────────────
  useEffect(() => {
    addAgentMessage(
      `Report folder created ✅\nFetching your corporate card transactions for the ${POLICY_LABELS[meta.policy] || meta.policy} policy…`
    );

    async function load() {
      try {
        const data = await getTransactions(reportId);
        setTransactions(data.transactions);
        setFolderStatus('EXPENSES_LOADED');
        addAgentMessage(
          `Found ${data.totalCount} transaction${data.totalCount !== 1 ? 's' : ''} from your corporate card.\nPlease upload your receipts now so I can match them automatically.`
        );
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to load transactions.';
        setTxnError(msg);
        addAgentMessage(`I couldn't load your transactions: ${msg}`);
      } finally {
        setTxnLoading(false);  // always unblock the upload button
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  // ── Handle receipt upload ─────────────────────────────────
  async function handleUpload(files) {
    setProcessing(true);
    setFolderStatus('PROCESSING');
    addAgentMessage(`Processing ${files.length} receipt${files.length !== 1 ? 's' : ''}… this may take a moment.`);

    try {
      const data = await processReceipts(reportId, files);
      setProcessedExpenses(data.expenses || []);
      setWarnings(data.warnings || []);
      setFolderStatus('REVIEW');

      const warningCount = (data.warnings || []).length;
      addAgentMessage(
        `Done! I matched ${data.matched} of ${data.processed} receipt${data.processed !== 1 ? 's' : ''} to your corporate card.` +
        (warningCount > 0
          ? `\n⚠️ ${warningCount} policy warning${warningCount !== 1 ? 's' : ''} found — please review before submitting.`
          : '\nNo policy issues found. You can submit when ready.')
      );
    } catch (err) {
      const msg = err.response?.data?.error || 'Receipt processing failed.';
      setFolderStatus('EXPENSES_LOADED');
      addAgentMessage(`Receipt processing failed: ${msg}\nPlease try uploading again.`);
    } finally {
      setProcessing(false);
    }
  }

  // ── Handle submit ─────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    addAgentMessage('Submitting your expense report to SAP Concur…');

    try {
      const data = await submitReport(reportId);
      setConfirmation(data);
      setFolderStatus('SUBMITTED');
      addAgentMessage(
        `Your report has been submitted successfully 🎉\n${data.message || `Status: ${data.status}`}`
      );
    } catch (err) {
      const msg = err.response?.data?.error || 'Submission failed.';
      setSubmitError(msg);
      addAgentMessage(`Submission failed: ${msg}\nPlease try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  const hasErrors = warnings.some(w => w.severity === 'ERROR');
  const canSubmit = (folderStatus === 'REVIEW' || processedExpenses.length > 0) && !hasErrors && !submitting;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="report-folder-page">

      {/* ── Main content ── */}
      <div className="report-folder-main">

        {/* Report header */}
        <Tile className="report-header-tile">
          <div className="report-header-top">
            <div>
              <h1 className="report-header-name">{meta.reportName || reportId}</h1>
              <p className="report-header-purpose">{meta.businessPurpose}</p>
            </div>
            <div className="report-header-meta">
              <Tag type="blue" size="sm">{POLICY_LABELS[meta.policy] || meta.policy}</Tag>
              <Tag type="teal" size="sm">{CATEGORY_LABELS[meta.reportCategory] || meta.reportCategory}</Tag>
              <Tag
                type={
                  folderStatus === 'SUBMITTED' ? 'green'
                  : folderStatus === 'REVIEW' ? 'purple'
                  : folderStatus === 'PROCESSING' ? 'blue'
                  : 'gray'
                }
                size="sm"
              >
                {folderStatus}
              </Tag>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6f6f6f', margin: 0 }}>
            Report ID: <strong>{reportId}</strong>
          </p>
        </Tile>

        {/* Confirmation banner */}
        {confirmation && (
          <Tile className="confirmation-tile">
            <p className="confirmation-title">Report Submitted Successfully ✅</p>
            <p className="confirmation-id">
              {confirmation.message || `Status: ${confirmation.status}`}
            </p>
          </Tile>
        )}

        {/* Available Expenses */}
        <div className="available-expenses-section">
          <p className="section-heading">Available Expenses (Corporate Card)</p>
          <AvailableExpensesTable
            transactions={transactions}
            loading={txnLoading}
            error={txnError}
          />
        </div>

        {/* Receipt Upload */}
        {folderStatus !== 'SUBMITTED' && (
          <div className="receipt-upload-section">
            <p className="section-heading">Upload Receipts</p>
            <ReceiptUploadArea
              onUpload={handleUpload}
              processing={processing}
              disabled={folderStatus === 'SUBMITTED'}
            />
          </div>
        )}

        {/* Processed Expenses */}
        {processedExpenses.length > 0 && (
          <div className="processed-expenses-section">
            <p className="section-heading">
              Processed Expenses ({processedExpenses.filter(e => e.matchedTxnId).length}/{processedExpenses.length} matched)
            </p>
            <ProcessedExpensesTable expenses={processedExpenses} />
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="warnings-section">
            <p className="section-heading">Policy Warnings</p>
            <WarningsList warnings={warnings} />
          </div>
        )}

        {/* Submit bar */}
        {folderStatus !== 'SUBMITTED' && processedExpenses.length > 0 && (
          <div className="submit-bar">
            <p className="submit-bar-info">
              {hasErrors
                ? 'Fix the errors above before submitting.'
                : warnings.length > 0
                ? `${warnings.length} warning${warnings.length !== 1 ? 's' : ''} — you can still submit.`
                : 'All checks passed. Ready to submit.'}
            </p>
            <Button
              kind="secondary"
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting ? 'Submitting…' : 'Submit Report'}
            </Button>
          </div>
        )}

        {submitError && (
          <div style={{ marginTop: '1rem' }}>
            <WarningsList warnings={[{ code: 'SUBMIT_ERROR', message: submitError, severity: 'ERROR' }]} />
          </div>
        )}

      </div>

      {/* ── Chat panel ── */}
      <ChatPanel messages={chatMessages} onMessage={addAgentMessage} folderStatus={folderStatus} />

    </div>
  );
}

export default ReportFolderPage;
