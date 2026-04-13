/**
 * Adapter Read-Only para a API do GitHub.
 * Encapsula consultas ao repositório, garantindo tratamento de erros e fallback para modo seguro.
 */
export declare class GitHubReadService {
    private client;
    private config;
    /**
     * Obtém informações básicas do repositório configurado.
     */
    getRepoInfo(): Promise<{
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        owner: import("@octokit/openapi-types").components["schemas"]["simple-user"];
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        url: string;
        archive_url: string;
        assignees_url: string;
        blobs_url: string;
        branches_url: string;
        collaborators_url: string;
        comments_url: string;
        commits_url: string;
        compare_url: string;
        contents_url: string;
        contributors_url: string;
        deployments_url: string;
        downloads_url: string;
        events_url: string;
        forks_url: string;
        git_commits_url: string;
        git_refs_url: string;
        git_tags_url: string;
        git_url: string;
        issue_comment_url: string;
        issue_events_url: string;
        issues_url: string;
        keys_url: string;
        labels_url: string;
        languages_url: string;
        merges_url: string;
        milestones_url: string;
        notifications_url: string;
        pulls_url: string;
        releases_url: string;
        ssh_url: string;
        stargazers_url: string;
        statuses_url: string;
        subscribers_url: string;
        subscription_url: string;
        tags_url: string;
        teams_url: string;
        trees_url: string;
        clone_url: string;
        mirror_url: string | null;
        hooks_url: string;
        svn_url: string;
        homepage: string | null;
        language: string | null;
        forks_count: number;
        stargazers_count: number;
        watchers_count: number;
        size: number;
        default_branch: string;
        open_issues_count: number;
        is_template?: boolean;
        topics?: string[];
        has_issues: boolean;
        has_projects: boolean;
        has_wiki: boolean;
        has_pages: boolean;
        has_downloads?: boolean;
        has_discussions: boolean;
        archived: boolean;
        disabled: boolean;
        visibility?: string;
        pushed_at: string;
        created_at: string;
        updated_at: string;
        permissions?: {
            admin: boolean;
            maintain?: boolean;
            push: boolean;
            triage?: boolean;
            pull: boolean;
        };
        allow_rebase_merge?: boolean;
        template_repository?: import("@octokit/openapi-types").components["schemas"]["nullable-repository"];
        temp_clone_token?: string | null;
        allow_squash_merge?: boolean;
        allow_auto_merge?: boolean;
        delete_branch_on_merge?: boolean;
        allow_merge_commit?: boolean;
        allow_update_branch?: boolean;
        use_squash_pr_title_as_default?: boolean;
        squash_merge_commit_title?: "PR_TITLE" | "COMMIT_OR_PR_TITLE";
        squash_merge_commit_message?: "PR_BODY" | "COMMIT_MESSAGES" | "BLANK";
        merge_commit_title?: "PR_TITLE" | "MERGE_MESSAGE";
        merge_commit_message?: "PR_BODY" | "PR_TITLE" | "BLANK";
        allow_forking?: boolean;
        web_commit_signoff_required?: boolean;
        subscribers_count: number;
        network_count: number;
        license: import("@octokit/openapi-types").components["schemas"]["nullable-license-simple"];
        organization?: import("@octokit/openapi-types").components["schemas"]["nullable-simple-user"];
        parent?: import("@octokit/openapi-types").components["schemas"]["repository"];
        source?: import("@octokit/openapi-types").components["schemas"]["repository"];
        forks: number;
        master_branch?: string;
        open_issues: number;
        watchers: number;
        anonymous_access_enabled?: boolean;
        code_of_conduct?: import("@octokit/openapi-types").components["schemas"]["code-of-conduct-simple"];
        security_and_analysis?: import("@octokit/openapi-types").components["schemas"]["security-and-analysis"];
        custom_properties?: {
            [key: string]: unknown;
        };
    }>;
    /**
     * Retorna os detalhes de uma branch específica.
     */
    getBranch(branchName: string): Promise<{
        name: string;
        commit: import("@octokit/openapi-types").components["schemas"]["commit"];
        _links: {
            html: string;
            self: string;
        };
        protected: boolean;
        protection: import("@octokit/openapi-types").components["schemas"]["branch-protection"];
        protection_url: string;
        pattern?: string;
        required_approving_review_count?: number;
    }>;
    /**
     * Lista os commits mais recentes de uma branch.
     */
    listRecentCommits(branchName: string, limit?: number): Promise<{
        url: string;
        sha: string;
        node_id: string;
        html_url: string;
        comments_url: string;
        commit: {
            url: string;
            author: import("@octokit/openapi-types").components["schemas"]["nullable-git-user"];
            committer: import("@octokit/openapi-types").components["schemas"]["nullable-git-user"];
            message: string;
            comment_count: number;
            tree: {
                sha: string;
                url: string;
            };
            verification?: import("@octokit/openapi-types").components["schemas"]["verification"];
        };
        author: import("@octokit/openapi-types").components["schemas"]["simple-user"] | import("@octokit/openapi-types").components["schemas"]["empty-object"] | null;
        committer: import("@octokit/openapi-types").components["schemas"]["simple-user"] | import("@octokit/openapi-types").components["schemas"]["empty-object"] | null;
        parents: {
            sha: string;
            url: string;
            html_url?: string;
        }[];
        stats?: {
            additions?: number;
            deletions?: number;
            total?: number;
        };
        files?: import("@octokit/openapi-types").components["schemas"]["diff-entry"][];
    }[]>;
    /**
     * Obtém detalhes de um Pull Request.
     */
    getPullRequest(pullNumber: number): Promise<{
        url: string;
        id: number;
        node_id: string;
        html_url: string;
        diff_url: string;
        patch_url: string;
        issue_url: string;
        commits_url: string;
        review_comments_url: string;
        review_comment_url: string;
        comments_url: string;
        statuses_url: string;
        number: number;
        state: "open" | "closed";
        locked: boolean;
        title: string;
        user: import("@octokit/openapi-types").components["schemas"]["simple-user"];
        body: string | null;
        labels: {
            id: number;
            node_id: string;
            url: string;
            name: string;
            description: string | null;
            color: string;
            default: boolean;
        }[];
        milestone: import("@octokit/openapi-types").components["schemas"]["nullable-milestone"];
        active_lock_reason?: string | null;
        created_at: string;
        updated_at: string;
        closed_at: string | null;
        merged_at: string | null;
        merge_commit_sha: string | null;
        assignee: import("@octokit/openapi-types").components["schemas"]["nullable-simple-user"];
        assignees?: import("@octokit/openapi-types").components["schemas"]["simple-user"][] | null;
        requested_reviewers?: import("@octokit/openapi-types").components["schemas"]["simple-user"][] | null;
        requested_teams?: import("@octokit/openapi-types").components["schemas"]["team-simple"][] | null;
        head: {
            label: string;
            ref: string;
            repo: import("@octokit/openapi-types").components["schemas"]["repository"];
            sha: string;
            user: import("@octokit/openapi-types").components["schemas"]["simple-user"];
        };
        base: {
            label: string;
            ref: string;
            repo: import("@octokit/openapi-types").components["schemas"]["repository"];
            sha: string;
            user: import("@octokit/openapi-types").components["schemas"]["simple-user"];
        };
        _links: {
            comments: import("@octokit/openapi-types").components["schemas"]["link"];
            commits: import("@octokit/openapi-types").components["schemas"]["link"];
            statuses: import("@octokit/openapi-types").components["schemas"]["link"];
            html: import("@octokit/openapi-types").components["schemas"]["link"];
            issue: import("@octokit/openapi-types").components["schemas"]["link"];
            review_comments: import("@octokit/openapi-types").components["schemas"]["link"];
            review_comment: import("@octokit/openapi-types").components["schemas"]["link"];
            self: import("@octokit/openapi-types").components["schemas"]["link"];
        };
        author_association: import("@octokit/openapi-types").components["schemas"]["author-association"];
        auto_merge: import("@octokit/openapi-types").components["schemas"]["auto-merge"];
        draft?: boolean;
        merged: boolean;
        mergeable: boolean | null;
        rebaseable?: boolean | null;
        mergeable_state: string;
        merged_by: import("@octokit/openapi-types").components["schemas"]["nullable-simple-user"];
        comments: number;
        review_comments: number;
        maintainer_can_modify: boolean;
        commits: number;
        additions: number;
        deletions: number;
        changed_files: number;
    }>;
    /**
     * Lista os arquivos modificados em um commit específico.
     */
    listChangedFiles(commitSha: string): Promise<{
        sha: string | null;
        filename: string;
        status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
        additions: number;
        deletions: number;
        changes: number;
        blob_url: string;
        raw_url: string;
        contents_url: string;
        patch?: string;
        previous_filename?: string;
    }[]>;
    /**
     * Obtém a release mais recente.
     */
    getLatestRelease(): Promise<{
        url: string;
        html_url: string;
        assets_url: string;
        upload_url: string;
        tarball_url: string | null;
        zipball_url: string | null;
        id: number;
        node_id: string;
        tag_name: string;
        target_commitish: string;
        name: string | null;
        body?: string | null;
        draft: boolean;
        prerelease: boolean;
        immutable?: boolean;
        created_at: string;
        published_at: string | null;
        updated_at?: string | null;
        author: import("@octokit/openapi-types").components["schemas"]["simple-user"];
        assets: import("@octokit/openapi-types").components["schemas"]["release-asset"][];
        body_html?: string;
        body_text?: string;
        mentions_count?: number;
        discussion_url?: string;
        reactions?: import("@octokit/openapi-types").components["schemas"]["reaction-rollup"];
    } | null>;
}
//# sourceMappingURL=github.read.service.d.ts.map