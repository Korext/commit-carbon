# Prior Art

Commit Carbon builds on and differentiates from the following prior work.

## Academic Research

**Strubell, E., Ganesh, A., McCallum, A. (2019). "Energy and Policy Considerations for Deep Learning in NLP." ACL 2019.**
Covers training emissions for NLP models. Established early awareness of AI energy costs. How we use: context for training emissions (out of scope for Commit Carbon but referenced).

**Patterson, D., et al. (2021). "Carbon Emissions and Large Neural Network Training." arXiv preprint.**
Carbon accounting methodology for large model training. How we use: methodological reference for accounting approaches.

**Luccioni, A. S., et al. (2023). "Power Hungry Processing: Watts Driving the Cost of AI Deployment."**
Inference emissions for deployed models. Critical baseline for our per-token energy estimates. How we use: primary source for inference energy factors.

**Li, P., et al. (2023). "Making AI Less Thirsty: Uncovering and Addressing the Secret Water Footprint of AI Models."**
Water consumption from AI inference cooling. How we use: noted for future v2.0 water footprint extension.

## Existing Tools

**Code Carbon (github.com/mlco2/codecarbon)**
Measures training and inference emissions for ML models. Does not cover AI coding tool usage at commit level. Different scope entirely. Commit Carbon is complementary.

**ML CO2 Impact Calculator (mlco2.github.io/impact)**
Calculates emissions from model training runs. Scope: model training only, not coding tool invocation.

**Green Software Foundation Carbon Aware SDK**
Enables software to schedule workloads based on grid carbon intensity. Data aware computing tool, not a measurement framework for existing emissions. We reference their work on carbon aware scheduling.

**Electricity Maps (electricitymaps.com)**
Real-time grid carbon intensity data by zone. Data source that Commit Carbon integrates as an optional grid adapter. Not a measurement framework.

**WattTime (watttime.org)**
Real-time marginal emissions data. Data source that Commit Carbon integrates as an optional grid adapter.

## Standards and Frameworks

**GHG Protocol (ghgprotocol.org)**
Defines Scope 1/2/3 emissions framework. Commit Carbon aligns with Scope 3 Category 1 (Purchased Goods and Services). We do not copy GHG Protocol text.

**CDP (cdp.net)**
Disclosure framework for environmental impact. Commit Carbon generates CDP compatible outputs. We do not copy CDP questionnaire text.

**SBTi (sciencebasedtargets.org)**
Science Based Targets initiative for emissions reduction. Commit Carbon data can inform SBTi target setting but does not implement SBTi methodology.

**ISO 14064**
International standard for greenhouse gas accounting. Commit Carbon methodology is designed to be ISO 14064 compatible.

## What Makes Commit Carbon Different

None of the above tools or standards provide:

1. Commit level granularity for AI coding emissions
2. CSRD compatible disclosure format specifically for AI coding
3. Aggregation from ai-attestation data
4. Regional grid integration for coding tool emissions
5. Methodology audit and third party verification support

Commit Carbon is the first tool to occupy this specific intersection.
