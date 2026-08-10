# MVP architecture

## Purpose

The MVP demonstrates the control-plane logic of a national environmental
infrastructure without claiming production deployment. It makes the documented
scope inspectable and connects a small operational slice end to end.

## Functional layers

1. Feature and evidence registry
   - preserves the source record identifier, domain, function type, description,
     documentation status, reuse note, and source reference;
   - keeps the difference between a documented capability and a deployed
     service visible.

2. Environmental operating view
   - presents representative monitoring signals;
   - groups signals by national environmental domain;
   - calculates a transparent demonstrator risk score.

3. Scenario simulation
   - applies explicit pressure or intervention deltas;
   - produces an impact summary and a reversibility indicator;
   - records assumptions so a reviewer can reproduce the result.

4. Decision support
   - converts the operating state into a structured decision brief;
   - separates observed signal, modelled risk, recommended action, and evidence;
   - provides a simple decision trace suitable for later integration with a
     governed institutional workflow.

## Production boundary

This MVP uses synthetic demonstration signals. Production deployment would
require validated data contracts, sensor and satellite integrations, identity
and access controls, cyber-security controls, geospatial services, model
validation, legal authority mapping, audit retention, and operational service
levels.

