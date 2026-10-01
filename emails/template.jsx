import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components";

export default function EmailTemplate({
  userName = "Valued Member",
  type = "monthly-report",
  data = {},
}) {
  if (type === "monthly-report") {
    const stats = data?.stats || {
      totalIncome: 0,
      totalExpenses: 0,
      byCategory: {},
    };
    const netSavings = stats.totalIncome - stats.totalExpenses;
    const savingsRate =
      stats.totalIncome > 0
        ? ((netSavings / stats.totalIncome) * 100).toFixed(1)
        : "0.0";
    const transactions = data?.transactions || [];

    return (
      <Html>
        <Head />
        <Preview>{`Your ${data?.month} Financial Summary & Report | Wealth ERP`}</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            {/* Header Brand Banner */}
            <Section style={styles.header}>
              <Text style={styles.brandTitle}>WEALTH ERP</Text>
              <Text style={styles.headerSubtitle}>
                Monthly Financial Statement • {data?.month}
              </Text>
            </Section>

            {/* Greeting */}
            <Section style={styles.contentSection}>
              <Text style={styles.greeting}>Hello {userName},</Text>
              <Text style={styles.leadText}>
                Here is your comprehensive monthly financial statement for{" "}
                <strong style={{ color: "#1e293b" }}>{data?.month}</strong>. An
                official, itemized PDF statement is attached to this email for
                your financial records.
              </Text>

              {/* KPI Cards Grid */}
              <Section style={styles.kpiContainer}>
                <Row>
                  <Column style={styles.kpiCol}>
                    <div style={styles.kpiCard}>
                      <Text style={styles.kpiLabel}>TOTAL INCOME</Text>
                      <Text style={styles.kpiValueIncome}>
                        +₹{stats.totalIncome?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </Text>
                    </div>
                  </Column>
                  <Column style={styles.kpiCol}>
                    <div style={styles.kpiCard}>
                      <Text style={styles.kpiLabel}>TOTAL EXPENSES</Text>
                      <Text style={styles.kpiValueExpense}>
                        -₹{stats.totalExpenses?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </Text>
                    </div>
                  </Column>
                </Row>
                <Row style={{ marginTop: "12px" }}>
                  <Column style={styles.kpiCol}>
                    <div style={styles.kpiCard}>
                      <Text style={styles.kpiLabel}>NET CASH FLOW</Text>
                      <Text
                        style={
                          netSavings >= 0
                            ? styles.kpiValueIncome
                            : styles.kpiValueExpense
                        }
                      >
                        {netSavings >= 0 ? "+" : ""}₹
                        {netSavings?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </Text>
                    </div>
                  </Column>
                  <Column style={styles.kpiCol}>
                    <div style={styles.kpiCard}>
                      <Text style={styles.kpiLabel}>SAVINGS RATE</Text>
                      <Text style={styles.kpiValueRate}>{savingsRate}%</Text>
                    </div>
                  </Column>
                </Row>
              </Section>

              {/* PDF Attachment Notice */}
              <Section style={styles.pdfNoticeCard}>
                <Text style={styles.pdfNoticeTitle}>
                  📎 Official PDF Statement Attached
                </Text>
                <Text style={styles.pdfNoticeText}>
                  A full itemized transaction statement (with date, merchant,
                  account, category, and amounts) has been compiled and attached
                  to this email as a PDF. You can download or print it for your
                  tax and bookkeeping records.
                </Text>
              </Section>

              {/* Category Spending Breakdown */}
              {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
                <Section style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>
                    Expense Breakdown by Category
                  </Text>
                  <div style={styles.tableCard}>
                    {Object.entries(stats.byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, amount], idx) => {
                        const pct =
                          stats.totalExpenses > 0
                            ? ((amount / stats.totalExpenses) * 100).toFixed(1)
                            : "0";
                        return (
                          <div
                            key={category}
                            style={{
                              ...styles.tableRow,
                              borderBottom:
                                idx === Object.keys(stats.byCategory).length - 1
                                  ? "none"
                                  : "1px solid #f1f5f9",
                            }}
                          >
                            <Text style={styles.tableCategoryText}>
                              {category.toUpperCase()}
                            </Text>
                            <Text style={styles.tableAmountText}>
                              ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              <span style={styles.pctBadge}> ({pct}%)</span>
                            </Text>
                          </div>
                        );
                      })}
                  </div>
                </Section>
              )}

              {/* Recent Transactions List (in-email preview) */}
              {transactions && transactions.length > 0 && (
                <Section style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>
                    Notable Transactions This Month
                  </Text>
                  <div style={styles.tableCard}>
                    {transactions.slice(0, 8).map((tx, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.tableRow,
                          borderBottom:
                            idx === Math.min(transactions.length, 8) - 1
                              ? "none"
                              : "1px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <Text style={styles.txDesc}>
                            {tx.description || tx.category}
                          </Text>
                          <Text style={styles.txMeta}>
                            {tx.date
                              ? new Date(tx.date).toLocaleDateString("en-IN")
                              : ""}{" "}
                            • {tx.category}
                          </Text>
                        </div>
                        <Text
                          style={
                            tx.type === "EXPENSE"
                              ? styles.txAmountExpense
                              : styles.txAmountIncome
                          }
                        >
                          {tx.type === "EXPENSE" ? "-" : "+"}₹
                          {Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Text>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* AI Financial Insights */}
              {data?.insights && data.insights.length > 0 && (
                <Section style={styles.aiCard}>
                  <Text style={styles.aiTitle}>✨ AI Financial Insights</Text>
                  {data.insights.map((insight, index) => (
                    <Text key={index} style={styles.aiItem}>
                      • {insight}
                    </Text>
                  ))}
                </Section>
              )}

              <Hr style={styles.divider} />

              {/* Footer */}
              <Text style={styles.footerText}>
                This automated statement was generated by <strong>Wealth ERP</strong>.
                For privacy and security, keep this statement confidential.
              </Text>
              <Text style={styles.footerSubText}>
                © {new Date().getFullYear()} Wealth ERP. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  // Budget Alert Template
  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Budget Alert: You reached 80%+ of your limit</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Section style={styles.headerAlert}>
              <Text style={styles.brandTitle}>WEALTH ERP</Text>
              <Text style={styles.headerSubtitle}>Budget Limit Notice</Text>
            </Section>

            <Section style={styles.contentSection}>
              <Text style={styles.greeting}>Hello {userName},</Text>
              <Text style={styles.leadText}>
                You have utilized{" "}
                <strong style={{ color: "#e11d48" }}>
                  {data?.percentageUsed?.toFixed?.(1) || data?.percentageUsed}%
                </strong>{" "}
                of your monthly budget limit for account{" "}
                <strong>{data?.accountName}</strong>.
              </Text>

              <Section style={styles.kpiContainer}>
                <Row>
                  <Column style={styles.kpiCol}>
                    <div style={styles.kpiCard}>
                      <Text style={styles.kpiLabel}>BUDGET ALLOCATED</Text>
                      <Text style={styles.kpiValueRate}>
                        ₹{data?.budgetAmount}
                      </Text>
                    </div>
                  </Column>
                  <Column style={styles.kpiCol}>
                    <div style={styles.kpiCard}>
                      <Text style={styles.kpiLabel}>TOTAL SPENT</Text>
                      <Text style={styles.kpiValueExpense}>
                        ₹{data?.totalExpenses}
                      </Text>
                    </div>
                  </Column>
                </Row>
              </Section>

              <Text style={styles.footerText}>
                Log in to your Wealth ERP dashboard to review spending or adjust
                your monthly budget limits.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}

const styles = {
  body: {
    backgroundColor: "#f8fafc",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: "0",
    padding: "32px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "580px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e2e8f0",
  },
  header: {
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    backgroundColor: "#4f46e5",
    padding: "28px 24px",
    textAlign: "center",
  },
  headerAlert: {
    background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
    backgroundColor: "#e11d48",
    padding: "28px 24px",
    textAlign: "center",
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    margin: "0 0 4px",
  },
  headerSubtitle: {
    color: "#e0e7ff",
    fontSize: "13px",
    margin: "0",
    fontWeight: "500",
  },
  contentSection: {
    padding: "28px 24px",
  },
  greeting: {
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  leadText: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 20px",
  },
  kpiContainer: {
    margin: "16px 0 24px",
  },
  kpiCol: {
    padding: "0 6px",
    width: "50%",
  },
  kpiCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "14px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  kpiLabel: {
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    margin: "0 0 4px",
  },
  kpiValueIncome: {
    color: "#10b981",
    fontSize: "17px",
    fontWeight: "800",
    margin: "0",
  },
  kpiValueExpense: {
    color: "#e11d48",
    fontSize: "17px",
    fontWeight: "800",
    margin: "0",
  },
  kpiValueRate: {
    color: "#4f46e5",
    fontSize: "17px",
    fontWeight: "800",
    margin: "0",
  },
  pdfNoticeCard: {
    backgroundColor: "#eff6ff",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #bfdbfe",
    margin: "0 0 24px",
  },
  pdfNoticeTitle: {
    color: "#1e40af",
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 4px",
  },
  pdfNoticeText: {
    color: "#1e3a8a",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0",
  },
  sectionBlock: {
    margin: "0 0 24px",
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 10px",
    letterSpacing: "0.2px",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  tableRow: {
    padding: "10px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableCategoryText: {
    color: "#334155",
    fontSize: "12px",
    fontWeight: "600",
    margin: "0",
  },
  tableAmountText: {
    color: "#0f172a",
    fontSize: "12px",
    fontWeight: "700",
    margin: "0",
  },
  pctBadge: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "400",
  },
  txDesc: {
    color: "#0f172a",
    fontSize: "12px",
    fontWeight: "600",
    margin: "0 0 2px",
  },
  txMeta: {
    color: "#64748b",
    fontSize: "11px",
    margin: "0",
  },
  txAmountExpense: {
    color: "#e11d48",
    fontSize: "13px",
    fontWeight: "700",
    margin: "0",
  },
  txAmountIncome: {
    color: "#10b981",
    fontSize: "13px",
    fontWeight: "700",
    margin: "0",
  },
  aiCard: {
    backgroundColor: "#faf5ff",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #e9d5ff",
    margin: "0 0 24px",
  },
  aiTitle: {
    color: "#7e22ce",
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  aiItem: {
    color: "#581c87",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 6px",
  },
  divider: {
    borderColor: "#e2e8f0",
    margin: "24px 0 16px",
  },
  footerText: {
    color: "#64748b",
    fontSize: "11px",
    lineHeight: "16px",
    textAlign: "center",
    margin: "0 0 6px",
  },
  footerSubText: {
    color: "#94a3b8",
    fontSize: "10px",
    textAlign: "center",
    margin: "0",
  },
};
