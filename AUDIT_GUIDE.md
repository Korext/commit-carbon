# Audit Guide for Commit Carbon Reports

This guide is for sustainability auditors verifying Commit Carbon reports in the context of CSRD, SEC, CDP, or other disclosure frameworks.

## Verification Procedure

### Step 1: Verify Inputs

1. Confirm the `.ai-attestation.yaml` file exists in the repository
2. Cross-reference commit counts with git history
3. Verify AI tool identification against git metadata (co-author trailers, commit messages)

### Step 2: Verify Emissions Factors

1. Open `factors.yaml` (bundled with CLI or at https://oss.korext.com/api/commit-carbon/factors)
2. Confirm the methodology version matches the report
3. Verify each factor has a source citation
4. Cross-reference cited sources (Luccioni et al. 2023, Patterson et al. 2021) for reasonableness

### Step 3: Verify Grid Intensity

1. Confirm the stated region and grid intensity in the report
2. Cross-reference with IEA published data for the stated country
3. If real-time data was used (Electricity Maps, WattTime), verify the data provider and timestamp

### Step 4: Reproduce the Calculation

Run independently:

```bash
npx @korext/commit-carbon calculate --tool <tool> --commits <n> --region <region>
```

Compare output with reported values. They should match within rounding tolerance.

### Step 5: Verify Ranged Estimates

Confirm that:
- Low, central, and high estimates are all present
- The ratio between high and low is approximately 4x
- The central estimate is used as the primary reported value
- Uncertainty is clearly disclosed

## Red Flags

Watch for:
- Reports using only the "low" estimate without disclosing the range
- Modified emissions factors without documented justification
- Region attribution that does not match where AI inference occurs
- Missing methodology version
- Claims of "zero emissions" AI coding (not supported by any current evidence)

## Methodology Document

Full methodology: https://oss.korext.com/commit-carbon/methodology

The methodology is CC0 1.0 licensed (public domain). Auditors may freely reference and reproduce it.

## Questions

Contact: maintainers@korext.com
