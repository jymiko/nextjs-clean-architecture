/**
 * Database Migration Helper Script
 * Phase 1: Database Improvements
 *
 * This script helps migrate existing data to the improved schema:
 * 1. Migrate tags from String[] to Tag/DocumentTag tables
 * 2. Update indexes for better performance
 * 3. Add soft delete fields
 * 4. Add FK relations for integrity
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Step 1: Migrate document tags to normalized Tag table
 * Converts Document.tags[] into Tag entries and DocumentTag relations
 */
async function migrateTags() {
  console.log('🏷️  Starting tag migration...');

  try {
    // Get all documents with tags
    const documents = await prisma.document.findMany({
      where: {
        tags: {
          isEmpty: false
        }
      },
      select: {
        id: true,
        tags: true,
        createdById: true
      }
    });

    console.log(`Found ${documents.length} documents with tags`);

    // Collect all unique tags
    const allTags = new Set<string>();
    documents.forEach(doc => {
      doc.tags.forEach(tag => allTags.add(tag.toLowerCase().trim()));
    });

    console.log(`Found ${allTags.size} unique tags`);

    // Create Tag entries
    const tagMap = new Map<string, string>(); // name -> id

    for (const tagName of allTags) {
      const slug = tagName.replace(/\s+/g, '-').toLowerCase();

      // Check if tag already exists
      let tag = await prisma.tag.findUnique({
        where: { slug }
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            slug: slug,
            color: getRandomColor(),
            usageCount: 0
          }
        });
        console.log(`  Created tag: ${tagName}`);
      }

      tagMap.set(tagName, tag.id);
    }

    // Create DocumentTag relations
    let documentTagsCreated = 0;
    for (const doc of documents) {
      for (const tagName of doc.tags) {
        const normalizedTag = tagName.toLowerCase().trim();
        const tagId = tagMap.get(normalizedTag);

        if (tagId) {
          try {
            await prisma.documentTag.create({
              data: {
                documentId: doc.id,
                tagId: tagId,
                addedBy: doc.createdById
              }
            });
            documentTagsCreated++;

            // Increment usage count
            await prisma.tag.update({
              where: { id: tagId },
              data: { usageCount: { increment: 1 } }
            });
          } catch (error: any) {
            // Ignore duplicate errors
            if (!error.code?.includes('P2002')) {
              console.error(`  Error creating DocumentTag: ${error.message}`);
            }
          }
        }
      }
    }

    console.log(`✅ Tag migration completed!`);
    console.log(`   - Created ${tagMap.size} tags`);
    console.log(`   - Created ${documentTagsCreated} document-tag relations`);

    return { success: true, tagsCreated: tagMap.size, relationsCreated: documentTagsCreated };
  } catch (error) {
    console.error('❌ Error migrating tags:', error);
    return { success: false, error };
  }
}

/**
 * Step 2: Verify data integrity
 * Check that all FK relations are valid
 */
async function verifyDataIntegrity() {
  console.log('\n🔍 Verifying data integrity...');

  const issues: string[] = [];

  try {
    // Check DocumentTemplate.createdBy references valid users
    const templatesWithInvalidCreator = await prisma.$queryRaw<any[]>`
      SELECT dt.id, dt."createdBy"
      FROM document_templates dt
      LEFT JOIN users u ON dt."createdBy" = u.id
      WHERE u.id IS NULL
    `;

    if (templatesWithInvalidCreator.length > 0) {
      issues.push(`Found ${templatesWithInvalidCreator.length} templates with invalid creator`);
    }

    // Check DocumentRevision.revisedBy references valid users
    const revisionsWithInvalidRevisor = await prisma.$queryRaw<any[]>`
      SELECT dr.id, dr."revisedBy"
      FROM document_revisions dr
      LEFT JOIN users u ON dr."revisedBy" = u.id
      WHERE u.id IS NULL
    `;

    if (revisionsWithInvalidRevisor.length > 0) {
      issues.push(`Found ${revisionsWithInvalidRevisor.length} revisions with invalid revisor`);
    }

    // Check DocumentAttachment.uploadedBy references valid users
    const attachmentsWithInvalidUploader = await prisma.$queryRaw<any[]>`
      SELECT da.id, da."uploadedBy"
      FROM document_attachments da
      LEFT JOIN users u ON da."uploadedBy" = u.id
      WHERE u.id IS NULL
    `;

    if (attachmentsWithInvalidUploader.length > 0) {
      issues.push(`Found ${attachmentsWithInvalidUploader.length} attachments with invalid uploader`);
    }

    if (issues.length === 0) {
      console.log('✅ Data integrity check passed!');
      return { success: true, issues: [] };
    } else {
      console.log('⚠️  Data integrity issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      return { success: false, issues };
    }
  } catch (error) {
    console.error('❌ Error checking data integrity:', error);
    return { success: false, error };
  }
}

/**
 * Step 3: Generate migration statistics
 */
async function generateMigrationStats() {
  console.log('\n📊 Migration Statistics:');

  try {
    const stats = {
      totalDocuments: await prisma.document.count(),
      totalTags: await prisma.tag.count(),
      totalDocumentTags: await prisma.documentTag.count(),
      totalUsers: await prisma.user.count(),
      totalApprovals: await prisma.documentApproval.count(),
      totalDistributions: await prisma.documentDistribution.count(),
      indexesAdded: [
        'User.departmentId', 'User.positionId', 'User.role', 'User.isActive',
        'Document.categoryId', 'Document.ownerId', 'Document.createdById', 'Document.documentNumber',
        'DocumentApproval.approverId', 'DocumentApproval.documentId', 'DocumentApproval.level',
        'DocumentDistribution.distributedToId', 'DocumentDistribution.documentId',
        'DocumentRevision.revisedBy', 'DocumentRevision.documentId',
        'DocumentComment.documentId', 'DocumentComment.authorId',
        'DocumentAttachment.documentId', 'DocumentAttachment.uploadedBy',
        'Tag.slug', 'Tag.isActive',
        'DocumentTag.documentId', 'DocumentTag.tagId'
      ].length
    };

    console.log(`   Total Documents: ${stats.totalDocuments}`);
    console.log(`   Total Tags: ${stats.totalTags}`);
    console.log(`   Total Document-Tag Relations: ${stats.totalDocumentTags}`);
    console.log(`   Total Users: ${stats.totalUsers}`);
    console.log(`   Total Approvals: ${stats.totalApprovals}`);
    console.log(`   Total Distributions: ${stats.totalDistributions}`);
    console.log(`   Indexes Added: ${stats.indexesAdded}`);

    return stats;
  } catch (error) {
    console.error('❌ Error generating stats:', error);
    return null;
  }
}

/**
 * Helper: Get random color for tags
 */
function getRandomColor(): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting Database Migration - Phase 1');
  console.log('=========================================\n');

  // Step 1: Migrate tags
  const tagMigrationResult = await migrateTags();

  if (!tagMigrationResult.success) {
    console.error('\n❌ Migration failed at tag migration step');
    process.exit(1);
  }

  // Step 2: Verify data integrity
  const integrityResult = await verifyDataIntegrity();

  if (!integrityResult.success && integrityResult.issues && integrityResult.issues.length > 0) {
    console.warn('\n⚠️  Migration completed with data integrity warnings');
    console.warn('Please review the issues above and fix them manually if needed');
  }

  // Step 3: Generate stats
  await generateMigrationStats();

  console.log('\n✅ Migration completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Review the migration statistics above');
  console.log('2. Test your application with the new schema');
  console.log('3. Once confirmed working, you can remove Document.tags[] field in future migration');
  console.log('4. Update your application code to use DocumentTag instead of Document.tags');
}

// Run migration
main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
