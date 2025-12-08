/**
 * Analytics Initialization Script
 * Phase 3: Initialize analytics tables with current data
 *
 * This script initializes analytics tables with aggregated data from existing records
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Initialize Document Analytics
 * Aggregates existing data for each document
 */
async function initDocumentAnalytics() {
  console.log('📊 Initializing Document Analytics...');

  try {
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        comments: true,
        distributions: true,
        approvals: { select: { createdAt: true, approvedAt: true } },
        qrCodes: { select: { scans: true } }
      }
    });

    let created = 0;

    for (const doc of documents) {
      // Calculate metrics
      const commentCount = doc.comments.length;
      const distributionCount = doc.distributions.length;
      const downloadCount = doc.qrCodes.reduce((sum, qr) => sum + qr.scans.length, 0);

      // Calculate average approval time
      const approvedApprovals = doc.approvals.filter(a => a.approvedAt);
      const approvalTime = approvedApprovals.length > 0
        ? approvedApprovals.reduce((sum, a) => {
            const diff = a.approvedAt!.getTime() - a.createdAt.getTime();
            return sum + (diff / (1000 * 60 * 60)); // Convert to hours
          }, 0) / approvedApprovals.length
        : null;

      // Calculate popularity score (0-100)
      const popularityScore = calculatePopularityScore({
        viewCount: 0, // Will be tracked from now on
        downloadCount,
        shareCount: 0,
        commentCount,
        distributionCount
      });

      // Create or update analytics
      await prisma.documentAnalytics.upsert({
        where: { documentId: doc.id },
        create: {
          documentId: doc.id,
          commentCount,
          distributionCount,
          downloadCount,
          approvalTime: approvalTime ? Math.round(approvalTime) : null,
          popularityScore
        },
        update: {
          commentCount,
          distributionCount,
          downloadCount,
          approvalTime: approvalTime ? Math.round(approvalTime) : null,
          popularityScore
        }
      });

      created++;
    }

    console.log(`✅ Created/updated ${created} document analytics records`);
    return { success: true, count: created };
  } catch (error) {
    console.error('❌ Error initializing document analytics:', error);
    return { success: false, error };
  }
}

/**
 * Initialize User Analytics
 * Aggregates existing data for each user
 */
async function initUserAnalytics() {
  console.log('👤 Initializing User Analytics...');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        documentsCreated: { select: { id: true } },
        documentApprovals: {
          select: {
            status: true,
            requestedAt: true,
            approvedAt: true,
            rejectedAt: true
          }
        },
        sessions: { select: { id: true, createdAt: true } },
        lastLogin: true
      }
    });

    let created = 0;

    for (const user of users) {
      // Calculate metrics
      const documentsCreated = user.documentsCreated.length;

      const approvedApprovals = user.documentApprovals.filter(a => a.status === 'APPROVED');
      const documentsApproved = approvedApprovals.length;

      const documentsRejected = user.documentApprovals.filter(a => a.status === 'REJECTED').length;

      // Calculate average approval time
      const avgApprovalTime = approvedApprovals.length > 0
        ? approvedApprovals.reduce((sum, a) => {
            if (a.approvedAt) {
              const diff = a.approvedAt.getTime() - a.requestedAt.getTime();
              return sum + (diff / (1000 * 60 * 60)); // Hours
            }
            return sum;
          }, 0) / approvedApprovals.length
        : null;

      const loginCount = user.sessions.length;

      // Calculate productivity score (0-100)
      const productivityScore = calculateProductivityScore({
        documentsCreated,
        documentsApproved,
        documentsRejected,
        averageApprovalTime: avgApprovalTime || 0,
        loginCount
      });

      // Create or update analytics
      await prisma.userAnalytics.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          documentsCreated,
          documentsApproved,
          documentsRejected,
          averageApprovalTime: avgApprovalTime ? Math.round(avgApprovalTime) : null,
          loginCount,
          lastLoginAt: user.lastLogin,
          productivityScore
        },
        update: {
          documentsCreated,
          documentsApproved,
          documentsRejected,
          averageApprovalTime: avgApprovalTime ? Math.round(avgApprovalTime) : null,
          loginCount,
          lastLoginAt: user.lastLogin,
          productivityScore
        }
      });

      created++;
    }

    console.log(`✅ Created/updated ${created} user analytics records`);
    return { success: true, count: created };
  } catch (error) {
    console.error('❌ Error initializing user analytics:', error);
    return { success: false, error };
  }
}

/**
 * Initialize Department Analytics
 * Aggregates existing data for each department
 */
async function initDepartmentAnalytics() {
  console.log('🏢 Initializing Department Analytics...');

  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        users: {
          select: {
            id: true,
            isActive: true,
            documentsOwned: {
              select: { id: true, status: true }
            },
            documentApprovals: {
              select: { status: true, requestedAt: true, approvedAt: true }
            }
          }
        }
      }
    });

    let created = 0;

    for (const dept of departments) {
      // Calculate metrics
      const userCount = dept.users.length;
      const activeUserCount = dept.users.filter(u => u.isActive).length;

      // Get all documents owned by users in this department
      const allDocs = dept.users.flatMap(u => u.documentsOwned);
      const totalDocuments = allDocs.length;
      const activeDocuments = allDocs.filter(d => d.status === 'ACTIVE').length;

      // Get pending approvals
      const pendingApprovals = dept.users.flatMap(u =>
        u.documentApprovals.filter(a => a.status === 'PENDING')
      ).length;

      // Calculate average approval time
      const approvedApprovals = dept.users.flatMap(u =>
        u.documentApprovals.filter(a => a.status === 'APPROVED' && a.approvedAt)
      );

      const avgApprovalTime = approvedApprovals.length > 0
        ? approvedApprovals.reduce((sum, a) => {
            const diff = a.approvedAt!.getTime() - a.requestedAt.getTime();
            return sum + (diff / (1000 * 60 * 60)); // Hours
          }, 0) / approvedApprovals.length
        : null;

      // Calculate performance score (0-100)
      const performanceScore = calculateDepartmentPerformance({
        totalDocuments,
        activeDocuments,
        pendingApprovals,
        averageApprovalTime: avgApprovalTime || 0,
        activeUserCount,
        userCount
      });

      // Create or update analytics
      await prisma.departmentAnalytics.upsert({
        where: { departmentId: dept.id },
        create: {
          departmentId: dept.id,
          totalDocuments,
          activeDocuments,
          pendingApprovals,
          averageApprovalTime: avgApprovalTime ? Math.round(avgApprovalTime) : null,
          userCount,
          activeUserCount,
          performanceScore
        },
        update: {
          totalDocuments,
          activeDocuments,
          pendingApprovals,
          averageApprovalTime: avgApprovalTime ? Math.round(avgApprovalTime) : null,
          userCount,
          activeUserCount,
          performanceScore
        }
      });

      created++;
    }

    console.log(`✅ Created/updated ${created} department analytics records`);
    return { success: true, count: created };
  } catch (error) {
    console.error('❌ Error initializing department analytics:', error);
    return { success: false, error };
  }
}

/**
 * Create initial system snapshot
 */
async function createSystemSnapshot() {
  console.log('📸 Creating system snapshot...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      totalDocuments,
      approvedDocs,
      rejectedDocs,
      pendingApprovals
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.document.count(),
      prisma.document.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.document.count({ where: { approvalStatus: 'REJECTED' } }),
      prisma.documentApproval.count({ where: { status: 'PENDING' } })
    ]);

    await prisma.systemAnalyticsSnapshot.create({
      data: {
        date: today,
        totalUsers,
        activeUsers,
        totalDocuments,
        documentsCreated: 0, // Start from today
        documentsApproved: approvedDocs,
        documentsRejected: rejectedDocs,
        pendingApprovals,
        apiRequestCount: 0,
        errorCount: 0
      }
    });

    console.log('✅ System snapshot created');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Snapshot already exists for today');
      return { success: true };
    }
    console.error('❌ Error creating system snapshot:', error);
    return { success: false, error };
  }
}

/**
 * Helper: Calculate popularity score
 */
function calculatePopularityScore(metrics: {
  viewCount: number;
  downloadCount: number;
  shareCount: number;
  commentCount: number;
  distributionCount: number;
}): number {
  const weights = {
    view: 1,
    download: 3,
    share: 5,
    comment: 4,
    distribution: 2
  };

  const score =
    (metrics.viewCount * weights.view) +
    (metrics.downloadCount * weights.download) +
    (metrics.shareCount * weights.share) +
    (metrics.commentCount * weights.comment) +
    (metrics.distributionCount * weights.distribution);

  // Normalize to 0-100 scale (assuming max realistic score is ~500)
  return Math.min(Math.round((score / 500) * 100), 100);
}

/**
 * Helper: Calculate productivity score
 */
function calculateProductivityScore(metrics: {
  documentsCreated: number;
  documentsApproved: number;
  documentsRejected: number;
  averageApprovalTime: number;
  loginCount: number;
}): number {
  let score = 0;

  // Documents created (0-30 points)
  score += Math.min((metrics.documentsCreated / 50) * 30, 30);

  // Documents approved (0-30 points)
  score += Math.min((metrics.documentsApproved / 100) * 30, 30);

  // Approval speed (0-20 points) - faster is better
  if (metrics.averageApprovalTime > 0) {
    const speedScore = Math.max(0, 20 - (metrics.averageApprovalTime / 24) * 20);
    score += speedScore;
  }

  // Rejection rate (0-10 points) - lower is better
  const totalReviewed = metrics.documentsApproved + metrics.documentsRejected;
  if (totalReviewed > 0) {
    const rejectionRate = metrics.documentsRejected / totalReviewed;
    score += (1 - rejectionRate) * 10;
  } else {
    score += 5; // Neutral score if no reviews yet
  }

  // Activity (0-10 points)
  score += Math.min((metrics.loginCount / 100) * 10, 10);

  return Math.round(score);
}

/**
 * Helper: Calculate department performance score
 */
function calculateDepartmentPerformance(metrics: {
  totalDocuments: number;
  activeDocuments: number;
  pendingApprovals: number;
  averageApprovalTime: number;
  activeUserCount: number;
  userCount: number;
}): number {
  let score = 0;

  // Document activity (0-25 points)
  if (metrics.totalDocuments > 0) {
    const activityRate = metrics.activeDocuments / metrics.totalDocuments;
    score += activityRate * 25;
  }

  // Approval backlog (0-25 points) - lower is better
  if (metrics.totalDocuments > 0) {
    const backlogRate = metrics.pendingApprovals / metrics.totalDocuments;
    score += Math.max(0, (1 - backlogRate) * 25);
  } else {
    score += 25;
  }

  // Approval speed (0-25 points)
  if (metrics.averageApprovalTime > 0) {
    const speedScore = Math.max(0, 25 - (metrics.averageApprovalTime / 48) * 25);
    score += speedScore;
  } else {
    score += 12.5;
  }

  // User engagement (0-25 points)
  if (metrics.userCount > 0) {
    const engagementRate = metrics.activeUserCount / metrics.userCount;
    score += engagementRate * 25;
  }

  return Math.round(score);
}

/**
 * Main initialization function
 */
async function main() {
  console.log('🚀 Starting Analytics Initialization');
  console.log('=====================================\n');

  // Step 1: Document Analytics
  const docResult = await initDocumentAnalytics();
  if (!docResult.success) {
    console.error('\n❌ Initialization failed at document analytics');
    process.exit(1);
  }

  // Step 2: User Analytics
  const userResult = await initUserAnalytics();
  if (!userResult.success) {
    console.error('\n❌ Initialization failed at user analytics');
    process.exit(1);
  }

  // Step 3: Department Analytics
  const deptResult = await initDepartmentAnalytics();
  if (!deptResult.success) {
    console.error('\n❌ Initialization failed at department analytics');
    process.exit(1);
  }

  // Step 4: System Snapshot
  const snapshotResult = await createSystemSnapshot();
  if (!snapshotResult.success) {
    console.error('\n❌ Initialization failed at system snapshot');
    process.exit(1);
  }

  console.log('\n✅ Analytics initialization completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Document analytics: ${docResult.count} records`);
  console.log(`   - User analytics: ${userResult.count} records`);
  console.log(`   - Department analytics: ${deptResult.count} records`);
  console.log(`   - System snapshot: Created`);

  console.log('\n💡 Next steps:');
  console.log('   1. Setup cron jobs for daily aggregation');
  console.log('   2. Build analytics dashboards');
  console.log('   3. Configure alerts and thresholds');
}

// Run initialization
main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
